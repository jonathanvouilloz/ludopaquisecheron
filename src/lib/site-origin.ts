export type SiteOriginEnvironment = { PUBLIC_SITE_ORIGIN?: string }

export function readSiteOrigin(
  environment: SiteOriginEnvironment = import.meta.env as SiteOriginEnvironment,
): URL | null {
  const raw = environment.PUBLIC_SITE_ORIGIN?.trim()
  if (!raw) return null
  try {
    const url = new URL(raw)
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      (url.pathname !== '/' && url.pathname !== '')
    ) return null
    url.pathname = '/'
    return url
  } catch {
    return null
  }
}

export function absoluteSiteUrl(pathname: string, origin = readSiteOrigin()): string | null {
  if (!origin || !pathname.startsWith('/') || pathname.startsWith('//')) return null
  return new URL(pathname, origin).toString()
}
