import type { APIRoute } from 'astro'
import { readSiteOrigin } from '../lib/site-origin'

export const prerender = true

export const GET: APIRoute = () => {
  const origin = readSiteOrigin()
  const body = `User-agent: *\nAllow: /\n${origin ? `Sitemap: ${new URL('/sitemap.xml', origin)}\n` : ''}`
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } })
}
