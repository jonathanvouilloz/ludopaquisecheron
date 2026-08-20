import type { APIRoute } from 'astro'
import { loadIndexableRoutes } from '../data/sitemap'
import { readSiteOrigin } from '../lib/site-origin'

const escapeXml = (value: string) => value.replace(/[<>&'\"]/g, (character) => ({
  '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
})[character]!)

export const GET: APIRoute = async () => {
  const origin = readSiteOrigin()
  const routes = origin ? await loadIndexableRoutes() : []
  const urls = routes.map((route) => `  <url><loc>${escapeXml(new URL(route, origin!).toString())}</loc></url>`).join('\n')
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  })
}
