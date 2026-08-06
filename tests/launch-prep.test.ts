import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import legacyRoutes from '../src/data/legacy-routes.json'
import { absoluteSiteUrl, readSiteOrigin } from '../src/lib/site-origin'
import { verifyLaunch } from '../scripts/verify-launch.mjs'

const projectFile = (path: string) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

describe('préparation déterministe du lancement', () => {
  it('valide une origine canonique HTTPS sans inventer de domaine', () => {
    expect(readSiteOrigin({})).toBeNull()
    expect(readSiteOrigin({ PUBLIC_SITE_ORIGIN: 'http://site.test' })).toBeNull()
    expect(readSiteOrigin({ PUBLIC_SITE_ORIGIN: 'https://site.ludo.test/path' })).toBeNull()
    expect(readSiteOrigin({ PUBLIC_SITE_ORIGIN: 'https://site.ludo.test' })?.toString()).toBe('https://site.ludo.test/')
    expect(absoluteSiteUrl('/activites', new URL('https://site.ludo.test'))).toBe('https://site.ludo.test/activites')
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
    for (const item of legacyRoutes.filter((item) => item.action !== 'keep')) {
      if (item.action === 'gone') {
        const escaped = item.source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const route = vercel.routes.find((candidate: { src?: string }) => candidate.src === `^${escaped}/?$`)
        expect(route?.status).toBe(410)
      } else {
        expect(vercel.redirects.find((candidate: { source: string }) => candidate.source === item.source)).toEqual({
          source: item.source, destination: item.destination, permanent: true,
        })
      }
    }
    expect(vercel.routes).toHaveLength(3)
  })

  it('conserve les pages métier non validées hors index', async () => {
    const [base, functioning, registration, sitemap] = await Promise.all([
      projectFile('src/layouts/BaseLayout.astro'),
      projectFile('src/pages/infos-pratiques/fonctionnement.astro'),
      projectFile('src/pages/infos-pratiques/inscription.astro'),
      projectFile('src/pages/sitemap.xml.ts'),
    ])
    expect(base).toContain("'noindex,follow'")
    expect(base).not.toContain('noindex,nofollow')
    expect(functioning).toMatch(/<PracticalLayout[^>]+noindex>/)
    expect(registration).toMatch(/<PracticalLayout[^>]+noindex>/)
    expect(sitemap).toContain('loadIndexableRoutes')
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
  })
})
