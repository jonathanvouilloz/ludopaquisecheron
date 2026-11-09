import { describe, expect, it, vi } from 'vitest'
import { loadPublishedRegulation } from '../src/data/regulation'
import { readLudoHubConfig } from '../src/lib/ludohub/config'

const config = readLudoHubConfig({ LUDOHUB_PUBLIC_API_BASE: 'https://hub.test', LUDOHUB_PUBLIC_LUDO_SLUG: 'paquis-secheron' })
const published = { annualFeeCents: 3000, currency: 'CHF', documents: [{ slug: 'reglement', kind: 'rules', title: 'Règlement', version: 5, contentMarkdown: '## Accès\n\n\uF0FB Tout le monde est bienvenu.\n\n<script>unsafe</script>' }] }

describe('published membership regulation', () => {
  it('uses the published form snapshot and formats Word bullets without changing its source', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json(published))
    const result = await loadPublishedRegulation(config, fetcher)
    expect(String(fetcher.mock.calls[0][0])).toBe('https://hub.test/api/forms/v1/paquis-secheron/family-membership')
    expect(result.source).toBe('live')
    expect(result.document?.version).toBe(5)
    expect(result.document?.markdown).toBe(published.documents[0].contentMarkdown)
    expect(result.document?.html.join('')).toContain('<li>Tout le monde est bienvenu.</li>')
    expect(result.document?.html.join('')).not.toContain('<script>')
  })
  it('does not invent or duplicate rules when no published rules exist', async () => {
    for (const payload of [{ ...published, documents: [] }, { ...published, documents: [published.documents[0], published.documents[0]] }, { ...published, documents: [{ ...published.documents[0], contentMarkdown: '' }] }]) {
      expect((await loadPublishedRegulation(config, vi.fn<typeof fetch>().mockResolvedValue(Response.json(payload)))).source).toBe('unavailable')
    }
  })
  it('does not fetch if the Hub is not configured and handles a publication disappearing', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response('', { status: 404 }))
    expect((await loadPublishedRegulation(readLudoHubConfig({}), fetcher)).document).toBeNull()
    expect(fetcher).not.toHaveBeenCalled()
    expect((await loadPublishedRegulation(config, fetcher)).document).toBeNull()
  })
})
