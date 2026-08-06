import { pathToFileURL } from 'node:url'

const origin = process.env.PUBLIC_SITE_ORIGIN
const api = process.env.LUDOHUB_PUBLIC_API_BASE

export function validHttpsOrigin(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash && ['', '/'].includes(url.pathname)
  } catch { return false }
}

export function validHttpsApiBase(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash && ['/', '/api/public/v1', '/api/public/v1/'].includes(url.pathname)
  } catch { return false }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!validHttpsOrigin(origin)) throw new Error('PUBLIC_SITE_ORIGIN doit être une origine HTTPS validée, sans chemin.')
  if (!validHttpsApiBase(api)) throw new Error('LUDOHUB_PUBLIC_API_BASE doit être une origine HTTPS validée, avec le chemin optionnel exact /api/public/v1.')
  if (process.env.PUBLIC_LAUNCH_FIXTURE_MODE === 'live') {
    const originHost = new URL(origin).hostname
    const apiHost = new URL(api).hostname
    if (!originHost.endsWith('.test') || !apiHost.endsWith('.test')) throw new Error('La fixture de lancement est strictement réservée aux origines .test.')
  }
}
