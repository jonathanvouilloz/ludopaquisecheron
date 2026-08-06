import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import legacyRoutes from '../src/data/legacy-routes.json'
import { absoluteSiteUrl, readSiteOrigin, serializeJsonLd } from '../src/lib/site-origin'
import { verifyLaunch } from '../scripts/verify-launch.mjs'
import gone from '../api/gone'
import { validHttpsApiBase } from '../scripts/validate-launch-env.mjs'

const projectFile = (path: string) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

describe('préparation déterministe du lancement', () => {
  it('valide une origine canonique HTTPS sans inventer de domaine', () => {
    expect(readSiteOrigin({})).toBeNull()
    expect(readSiteOrigin({ PUBLIC_SITE_ORIGIN: 'http://site.test' })).toBeNull()
    expect(readSiteOrigin({ PUBLIC_SITE_ORIGIN: 'https://site.ludo.test/path' })).toBeNull()
    expect(readSiteOrigin({ PUBLIC_SITE_ORIGIN: 'https://site.ludo.test' })?.toString()).toBe('https://site.ludo.test/')
    expect(absoluteSiteUrl('/activites', new URL('https://site.ludo.test'))).toBe('https://site.ludo.test/activites')
  })

  it('accepte uniquement le chemin public optionnel documenté pour l’API', () => {
    expect(validHttpsApiBase('https://api.ludo.test')).toBe(true)
    expect(validHttpsApiBase('https://api.ludo.test/api/public/v1')).toBe(true)
    expect(validHttpsApiBase('https://api.ludo.test/api/public/v1/')).toBe(true)
    expect(validHttpsApiBase('https://api.ludo.test/api/public/v2')).toBe(false)
    expect(validHttpsApiBase('https://api.ludo.test/other')).toBe(false)
    expect(validHttpsApiBase('https://user:secret@api.ludo.test')).toBe(false)
    expect(validHttpsApiBase('https://api.ludo.test?preview=1')).toBe(false)
    expect(validHttpsApiBase('https://api.ludo.test#fragment')).toBe(false)
    expect(validHttpsApiBase('http://api.ludo.test/api/public/v1')).toBe(false)
  })

  it('couvre exactement les 28 URL legacy avec des décisions sans chaîne', async () => {
    expect(legacyRoutes).toHaveLength(28)
    expect(new Set(legacyRoutes.map(({ source }) => source)).size).toBe(28)
    expect(legacyRoutes.find(({ source }) => source === '/')?.action).toBe('keep')
    expect(legacyRoutes.filter(({ action }) => action === 'gone').map(({ source }) => source).sort()).toEqual([
      '/agenda-modele', '/copie-de-agenda', '/radioludo-2-0',
    ])
    const destinations = new Set(legacyRoutes.filter((item) => item.action === 'redirect').map((item) => item.destination))
    expect([...destinations].every((destination) => !legacyRoutes.some((item) => item.source === destination && item.action === 'redirect'))).toBe(true)

    const vercel = JSON.parse(await projectFile('vercel.json'))
    expect(vercel.buildCommand).toBe('npm run build:launch')
    for (const item of legacyRoutes.filter((item) => item.action !== 'keep')) {
      if (item.action === 'gone') {
        expect(vercel.rewrites.find((candidate: { source: string }) => candidate.source === item.source)).toEqual({
          source: item.source, destination: '/api/gone',
        })
        expect(item).toMatchObject({ status: 410, handler: '/api/gone' })
      } else {
        expect(vercel.redirects.find((candidate: { source: string }) => candidate.source === item.source)).toEqual({
          source: item.source, destination: item.destination, permanent: true, preserveQueryParams: true,
        })
      }
    }
    expect(vercel).not.toHaveProperty('routes')
    expect(vercel.rewrites).toHaveLength(3)
    expect(vercel.redirects.every((redirect: { preserveQueryParams?: boolean }) => redirect.preserveQueryParams === true)).toBe(true)
  })

  it('sert les URL retirées avec une réponse 410 minimale', async () => {
    const response = gone()
    expect(response.status).toBe(410)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow')
    expect(response.headers.get('content-type')).toContain('text/plain')
    expect(await response.text()).toBe('Cette ressource n’est plus disponible.')
  })

  it('neutralise une fermeture de balise dans les données structurées', () => {
    const malicious = '</script><script>globalThis.compromised=true</script>'
    const serialized = serializeJsonLd({ name: malicious })
    expect(serialized).not.toContain('<')
    expect(serialized).not.toContain('</script>')
    expect(serialized).toContain('\\u003c/script>')
    expect(JSON.parse(serialized)).toEqual({ name: malicious })
  })

  it('conserve les pages métier non validées hors index', async () => {
    const [base, functioning, registration, sitemap, robots, error500] = await Promise.all([
      projectFile('src/layouts/BaseLayout.astro'),
      projectFile('src/pages/infos-pratiques/fonctionnement.astro'),
      projectFile('src/pages/infos-pratiques/inscription.astro'),
      projectFile('src/pages/sitemap.xml.ts'),
      projectFile('src/pages/robots.txt.ts'),
      projectFile('src/pages/500.astro'),
    ])
    expect(base).toContain("'noindex,follow'")
    expect(base).not.toContain('noindex,nofollow')
    expect(functioning).toMatch(/<PracticalLayout[^>]+noindex>/)
    expect(registration).toMatch(/<PracticalLayout[^>]+noindex>/)
    expect(sitemap).toContain('loadIndexableRoutes')
    expect(robots).not.toContain('Disallow:')
    expect(error500).toContain('temporairement indisponible')
    expect(base).not.toContain('og:image')
  })

  it('donne une description prudente aux pages auparavant génériques', async () => {
    const pages = await Promise.all([
      projectFile('src/pages/index.astro'),
      projectFile('src/pages/contact.astro'),
      projectFile('src/pages/infos-pratiques/index.astro'),
      projectFile('src/pages/infos-pratiques/faq.astro'),
      projectFile('src/pages/infos-pratiques/annuaire.astro'),
      projectFile('src/pages/styleguide.astro'),
    ])
    expect(pages.every((page) => /description="[^"]{40,}"/.test(page))).toBe(true)
  })

  it('audite un dist autonome avec une origine .test', async () => {
    const root = await mkdtemp(join(tmpdir(), 'ludo-launch-'))
    const dist = join(root, 'dist')
    const origin = 'https://site.ludo.test'
    const destinations = new Set(legacyRoutes.filter((item) => item.action === 'redirect').map((item) => item.destination!))
    const indexable = ['/', ...destinations]
    const html = (route: string, noindex = false) => `<!doctype html><html><head><meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow'}"><link rel="canonical" href="${origin}${route === '/' ? '/' : route}"><meta property="og:url" content="${origin}${route === '/' ? '/' : route}"><meta name="twitter:card" content="summary"><script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization"}</script></head><body></body></html>`
    for (const route of indexable) {
      const directory = route === '/' ? dist : join(dist, route.slice(1))
      await mkdir(directory, { recursive: true })
      await writeFile(join(directory, 'index.html'), html(route))
    }
    await writeFile(join(dist, '404.html'), html('/404', true))
    await writeFile(join(dist, '500.html'), html('/500', true))
    await writeFile(join(dist, 'sitemap.xml'), `<urlset>${indexable.map((route) => `<url><loc>${origin}${route === '/' ? '/' : route}</loc></url>`).join('')}</urlset>`)
    await writeFile(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`)
    const options = {
      dist,
      origin,
      manifest: fileURLToPath(new URL('../src/data/legacy-routes.json', import.meta.url)),
      vercel: fileURLToPath(new URL('../vercel.json', import.meta.url)),
    }
    await expect(verifyLaunch(options)).resolves.toEqual([])
    await writeFile(join(dist, 'index.html'), html('/') + '<p>Prototype de travail</p>')
    await expect(verifyLaunch(options)).resolves.toContain('/: contenu de repli/démonstration détecté.')
    await writeFile(join(dist, 'index.html'), html('/').replace(/<script type="application\/ld\+json">.*?<\/script>/, ''))
    await expect(verifyLaunch(options)).resolves.toContain('/: JSON-LD requis sur une page indexable.')
    await writeFile(join(dist, 'index.html'), html('/').replace('"Organization"', '"Person"'))
    await expect(verifyLaunch(options)).resolves.toContain('/: type JSON-LD absent ou non autorisé.')
  })
})
