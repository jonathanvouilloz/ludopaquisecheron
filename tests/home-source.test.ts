import { describe, expect, it, vi } from 'vitest'
import { loadHomepageData } from '../src/data/home'
import { createLudoHubClient } from '../src/lib/ludohub'

const ludo = { slug: 'paquis-secheron', name: 'Pâquis-Sécheron' }
const publishedAt = '2026-08-05T12:00:00.000Z'
const response = (data: unknown) =>
  new Response(JSON.stringify({ version: 1, data }), {
    headers: { 'content-type': 'application/json' },
  })

describe('source de la page d’accueil', () => {
  it('respecte les choix explicites de LudoHub sans prendre le premier Top 3', async () => {
    const topThrees = [
      { id: 'top-old', slug: 'ancien', theme: 'Ancien', games: [{ name: 'A1' }, { name: 'A2' }, { name: 'A3' }], isHomepage: false, publishedAt },
      { id: 'top-home', slug: 'accueil', theme: 'Accueil', games: [{ name: 'B1' }, { name: 'B2' }, { name: 'B3' }], isHomepage: true, publishedAt },
    ]
    const activities = [
      { id: 'a3', slug: 'rang-3', title: 'Rang 3', summary: '', location: null, image: null, lifecycle: 'active', featuredRank: 3, publishedAt, schedule: { type: 'permanent', recurrenceRule: null, dates: [] } },
      { id: 'a1', slug: 'rang-1', title: 'Rang 1', summary: '', location: null, image: null, lifecycle: 'active', featuredRank: 1, publishedAt, schedule: { type: 'permanent', recurrenceRule: null, dates: [] } },
      { id: 'a0', slug: 'non-mise-en-avant', title: 'Sans rang', summary: '', location: null, image: null, lifecycle: 'active', featuredRank: null, publishedAt, schedule: { type: 'permanent', recurrenceRule: null, dates: [] } },
    ]
    const fetcher = vi.fn().mockImplementation((url: URL) => {
      const path = url.pathname
      if (path.endsWith('/sites')) return Promise.resolve(response({ ludo, sites: [] }))
      if (path.endsWith('/announcements')) return Promise.resolve(response({ ludo, site: null, announcements: [] }))
      if (path.endsWith('/news')) return Promise.resolve(response({ ludo, site: null, news: [] }))
      if (path.endsWith('/activities')) return Promise.resolve(response({ ludo, site: null, timeZone: 'Europe/Zurich', activities }))
      if (path.endsWith('/top-threes')) return Promise.resolve(response({ ludo, site: null, topThrees }))
      const summary = topThrees.find((item) => path.endsWith(`/top-threes/${item.slug}`))
      if (summary) return Promise.resolve(response({ ludo, site: null, topThree: { ...summary, games: summary.games.map((game) => ({ ...game, description: null })), sites: [] } }))
      throw new Error(`URL inattendue: ${path}`)
    })
    const client = createLudoHubClient({ baseUrl: 'https://ludohub.example', fetch: fetcher })

    const home = await loadHomepageData(client)

    expect(home.noindex).toBe(false)
    expect(home.selectedTopThree?.slug).toBe('accueil')
    expect(home.featuredActivities.map((item) => item.slug)).toEqual(['rang-1', 'rang-3'])
    expect(home.announcements).toEqual({ source: 'live', items: [] })
  })

  it('garde les exemples explicitement en mode démo et ne fabrique aucune annonce', async () => {
    const client = createLudoHubClient({ environment: {} })

    const home = await loadHomepageData(client)

    expect(home.noindex).toBe(true)
    expect(home.demoNotice).toContain('Mode démonstration')
    expect(home.selectedTopThree).not.toBeNull()
    expect(home.announcements.items).toEqual([])
  })
})
