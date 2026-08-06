import { readdir, readFile, access } from 'node:fs/promises'
import { resolve, relative, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

const EXPECTED_NOINDEX = new Set(['/404', '/styleguide', '/infos-pratiques/fonctionnement', '/infos-pratiques/inscription'])
const UNSAFE_MARKERS = [/data-content-source=["']fallback/i, /mode d[ée]monstration/i, /profil provisoire/i, /contenu provisoire/i, /prototype/i]

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  return (await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name)
    return entry.isDirectory() ? filesBelow(path) : [path]
  }))).flat()
}

function routeForHtml(dist, file) {
  const local = relative(dist, file).split(sep).join('/')
  if (local === 'index.html') return '/'
  if (local.endsWith('/index.html')) return `/${local.slice(0, -'/index.html'.length)}`
  return `/${local.slice(0, -'.html'.length)}`
}

function attr(html, selector) {
  return html.match(selector)?.[1] ?? null
}

function internalLinks(html) {
  return [...html.matchAll(/\shref=["']([^"']+)["']/gi)].map((match) => match[1]).filter((href) => href.startsWith('/') && !href.startsWith('//'))
}

async function existsAsOutput(dist, pathname) {
  const clean = decodeURIComponent(pathname).replace(/^\/+|\/+$/g, '')
  const candidates = clean ? [resolve(dist, clean, 'index.html'), resolve(dist, `${clean}.html`), resolve(dist, clean)] : [resolve(dist, 'index.html')]
  for (const candidate of candidates) {
    try { await access(candidate); return true } catch { /* try next */ }
  }
  return false
}

export async function verifyLaunch({ dist = 'dist', origin: rawOrigin = process.env.PUBLIC_SITE_ORIGIN, manifest = 'src/data/legacy-routes.json', vercel = 'vercel.json' } = {}) {
  const errors = []
  let origin
  try {
    origin = new URL(rawOrigin ?? '')
    if (origin.protocol !== 'https:' || origin.username || origin.password || origin.search || origin.hash || !['', '/'].includes(origin.pathname)) throw new Error()
  } catch { return ['PUBLIC_SITE_ORIGIN doit être une origine HTTPS valide sans chemin.'] }

  const absoluteDist = resolve(dist)
  const files = await filesBelow(absoluteDist)
  const htmlFiles = files.filter((file) => file.endsWith('.html'))
  const pages = new Map()
  for (const file of htmlFiles) pages.set(routeForHtml(absoluteDist, file), await readFile(file, 'utf8'))

  for (const [route, html] of pages) {
    const robots = attr(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)/i)
    const isNoindex = robots?.toLowerCase().includes('noindex') ?? false
    if (EXPECTED_NOINDEX.has(route) !== isNoindex) errors.push(`${route}: statut noindex inattendu (${robots ?? 'absent'}).`)
    if (!isNoindex) {
      const expected = new URL(route, origin).toString()
      const canonical = attr(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)
      const ogUrl = attr(html, /<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)/i)
      if (canonical !== expected) errors.push(`${route}: canonical invalide.`)
      if (ogUrl !== expected) errors.push(`${route}: og:url invalide.`)
      if (!/<meta[^>]+name=["']twitter:card["']/i.test(html)) errors.push(`${route}: métadonnée Twitter absente.`)
    }
    if (!EXPECTED_NOINDEX.has(route) && UNSAFE_MARKERS.some((pattern) => pattern.test(html))) errors.push(`${route}: contenu de repli/démonstration détecté.`)
    for (const script of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
      try { JSON.parse(script[1]) } catch { errors.push(`${route}: JSON-LD invalide.`) }
    }
    for (const href of internalLinks(html)) {
      const pathname = href.split(/[?#]/, 1)[0]
      if (pathname && !(await existsAsOutput(absoluteDist, pathname))) errors.push(`${route}: lien interne cassé vers ${pathname}.`)
    }
  }

  const sitemap = await readFile(resolve(absoluteDist, 'sitemap.xml'), 'utf8')
  const sitemapUrls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]))
  const expectedUrls = new Set([...pages.keys()].filter((route) => !EXPECTED_NOINDEX.has(route)).map((route) => new URL(route, origin).toString()))
  for (const url of expectedUrls) if (!sitemapUrls.has(url)) errors.push(`sitemap.xml: URL indexable absente ${url}.`)
  for (const url of sitemapUrls) if (!expectedUrls.has(url)) errors.push(`sitemap.xml: URL exclue ou inconnue ${url}.`)

  const robots = await readFile(resolve(absoluteDist, 'robots.txt'), 'utf8')
  if (!robots.includes(`Sitemap: ${new URL('/sitemap.xml', origin)}`) || /Disallow:\s*\/$/m.test(robots)) errors.push('robots.txt: configuration de lancement invalide.')

  const legacy = JSON.parse(await readFile(resolve(manifest), 'utf8'))
  const config = JSON.parse(await readFile(resolve(vercel), 'utf8'))
  if (config.buildCommand !== 'npm run build:launch') errors.push('vercel.json: le build hébergé doit obligatoirement utiliser build:launch.')
  if (legacy.length !== 28 || new Set(legacy.map(({ source }) => source)).size !== 28) errors.push('Manifeste legacy: 28 routes uniques requises.')
  if ('routes' in config) errors.push('vercel.json: routes ne doit pas être combiné aux propriétés de routage haut niveau.')
  const goneRewrites = config.rewrites ?? []
  for (const item of legacy) {
    if (item.action === 'keep') continue
    if (item.action === 'gone') {
      const configured = goneRewrites.find((route) => route.source === item.source)
      if (!configured || configured.destination !== '/api/gone' || item.handler !== '/api/gone' || item.status !== 410) errors.push(`${item.source}: réécriture vers la fonction 410 absente ou incohérente.`)
    } else {
      const configured = (config.redirects ?? []).find((route) => route.source === item.source)
      if (!configured || configured.destination !== item.destination || configured.permanent !== true || configured.preserveQueryParams !== true || item.preserveQueryParams !== true) errors.push(`${item.source}: redirection permanente Vercel absente ou incohérente.`)
      if (!(await existsAsOutput(absoluteDist, item.destination))) errors.push(`${item.source}: destination inexistante ${item.destination}.`)
    }
  }
  if (goneRewrites.length !== 3) errors.push('vercel.json: exactement trois réécritures 410 sont requises.')
  try { await access(resolve('api/gone.ts')) } catch { errors.push('La fonction api/gone.ts est absente.') }
  if (!pages.has('/404')) errors.push('La page 404 statique est absente.')
  return [...new Set(errors)]
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const errors = await verifyLaunch()
  if (errors.length) {
    console.error(errors.map((error) => `- ${error}`).join('\n'))
    process.exitCode = 1
  } else console.log('Vérification de lancement réussie.')
}
