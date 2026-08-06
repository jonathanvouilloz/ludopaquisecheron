import type { APIRoute } from 'astro'
import { readSiteOrigin } from '../lib/site-origin'

export const prerender = true

export const GET: APIRoute = () => {
  const origin = readSiteOrigin()
  const body = origin
    ? `User-agent: *\nAllow: /\nDisallow: /styleguide\nDisallow: /infos-pratiques/fonctionnement\nDisallow: /infos-pratiques/inscription\nSitemap: ${new URL('/sitemap.xml', origin)}\n`
    : 'User-agent: *\nDisallow: /\n'
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } })
}
