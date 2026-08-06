const origin = process.env.PUBLIC_SITE_ORIGIN
const api = process.env.LUDOHUB_PUBLIC_API_BASE

function validHttpsOrigin(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash && ['', '/'].includes(url.pathname)
  } catch { return false }
}

if (!validHttpsOrigin(origin)) throw new Error('PUBLIC_SITE_ORIGIN doit être une origine HTTPS validée, sans chemin.')
if (!validHttpsOrigin(api)) throw new Error('LUDOHUB_PUBLIC_API_BASE doit être une origine HTTPS validée pour le build de lancement.')
if (process.env.PUBLIC_LAUNCH_FIXTURE_MODE === 'live') {
  const originHost = new URL(origin).hostname
  const apiHost = new URL(api).hostname
  if (!originHost.endsWith('.test') || !apiHost.endsWith('.test')) throw new Error('La fixture de lancement est strictement réservée aux origines .test.')
}
