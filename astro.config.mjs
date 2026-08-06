import { defineConfig } from 'astro/config'

const rawOrigin = process.env.PUBLIC_SITE_ORIGIN?.trim()
let site
if (rawOrigin) {
  const candidate = new URL(rawOrigin)
  if (candidate.protocol !== 'https:' || candidate.username || candidate.password || candidate.search || candidate.hash || !['', '/'].includes(candidate.pathname)) {
    throw new Error('PUBLIC_SITE_ORIGIN doit être une origine HTTPS sans chemin, identifiants, requête ni fragment.')
  }
  site = candidate.origin
}

export default defineConfig({
  site,
  output: 'static',
})
