import { readLudoHubConfig, type LudoHubConfig } from '../lib/ludohub/config'
import { markdownBlocks } from '../lib/editorial-markdown'

export type PublishedRegulation = {
  title: string
  version: number
  markdown: string
  html: string[]
  annualFeeCents: number
  currency: string
}
export type RegulationResult = {
  source: 'live' | 'unavailable'
  document: PublishedRegulation | null
}

/** Le snapshot publié d’adhésion reste la source unique du règlement public. */
export async function loadPublishedRegulation(
  config: LudoHubConfig = readLudoHubConfig(),
  fetcher: typeof fetch = globalThis.fetch,
): Promise<RegulationResult> {
  const unavailable: RegulationResult = { source: 'unavailable', document: null }
  if (!config.apiBase || config.issue) return unavailable
  const url = new URL(config.apiBase)
  url.pathname = `${url.pathname.replace(/\/api\/public\/v1$/, '/api/forms/v1')}/${encodeURIComponent(config.tenantSlug)}/family-membership`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), config.timeoutMs)
  try {
    const response = await fetcher(url, { headers: { Accept: 'application/json' }, signal: controller.signal })
    if (!response.ok) return unavailable
    const value: unknown = await response.json()
    if (!value || typeof value !== 'object' || Array.isArray(value)) return unavailable
    const payload = value as Record<string, unknown>
    if (!Array.isArray(payload.documents) || !Number.isSafeInteger(payload.annualFeeCents) || Number(payload.annualFeeCents) < 0 || typeof payload.currency !== 'string' || !/^[A-Z]{3}$/.test(payload.currency)) return unavailable
    const rules = payload.documents.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object' && !Array.isArray(item) && item.kind === 'rules')
    if (rules.length !== 1) return unavailable
    const document = rules[0]
    if (typeof document.title !== 'string' || !document.title.trim() || typeof document.contentMarkdown !== 'string' || !document.contentMarkdown.trim() || !Number.isSafeInteger(document.version) || Number(document.version) < 1) return unavailable
    // Puces héritées de Word : ajustement de présentation, sans modifier le snapshot.
    const markdown = document.contentMarkdown
    const displayMarkdown = markdown.replace(/^[\t ]*[\uF0FB\uF0B7][\t ]*/gm, '- ')
    return { source: 'live', document: {
      title: document.title,
      version: Number(document.version),
      markdown,
      html: markdownBlocks(displayMarkdown),
      annualFeeCents: Number(payload.annualFeeCents),
      currency: payload.currency,
    } }
  } catch {
    return unavailable
  } finally {
    clearTimeout(timer)
  }
}
