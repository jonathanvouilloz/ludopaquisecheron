import { describe, expect, it, vi } from 'vitest'
import { createLudoHubClient } from '../src/lib/ludohub/client'
import { loadActivityDetail, loadActivities, loadNews } from '../src/data/editorial'
import { loadPracticalFaqs, loadPracticalPlaces } from '../src/data/practical'

const ludo = { slug: 'paquis-secheron', name: 'Ludothèque des Pâquis-Sécheron' }
const publishedAt = '2026-10-06T14:20:06.373Z'
const secheron = { id: 'secheron-id', slug: 'secheron', name: 'Sécheron' }
const paquis = { id: 'paquis-id', slug: 'paquis', name: 'Pâquis' }
const activity = { id: 'activity-id', slug: 'jeux-gouter', title: 'Jeux & Goûter', summary: 'Un vendredi par mois.', location: null, image: null, lifecycle: 'active', featuredRank: null, publishedAt, rhythm: 'recurring', sites: [secheron] }
const response = (data: unknown) => Response.json({ version: 1, data })

describe('contrats de production site ↔ Hub', () => {
  it('affiche les réponses texte du Hub actuel sans passer aux réponses archivées', async () => {
    const client = createLudoHubClient({ baseUrl: 'https://hub.test', fetch: vi.fn<typeof fetch>().mockResolvedValue(response({ ludo, site: null, faqs: [
      { id: 'retours', question: 'Où rendre un jeu ?', answerText: 'Dans le lieu où il a été emprunté.', category: 'Emprunts et retours' },
      { id: 'visite', question: 'Peut-on jouer sans adhésion ?', answerText: 'Oui, le jeu sur place est libre.', category: 'Jeux sur place' },
    ] })) })
    const result = await loadPracticalFaqs(client)
    expect(result.source).toBe('live')
    expect(result.data.map((item) => [item.question, item.answerText])).toEqual([
      ['Où rendre un jeu ?', 'Dans le lieu où il a été emprunté.'],
      ['Peut-on jouer sans adhésion ?', 'Oui, le jeu sur place est libre.'],
    ])
    expect(result.data.map((item) => item.sortOrder)).toEqual([0, 1])
  })
  it('utilise les lieux sélectionnés dans les listes et les fiches, même sans texte location', async () => {
    const client = createLudoHubClient({ baseUrl: 'https://hub.test', fetch: vi.fn<typeof fetch>().mockImplementation(async (url) => {
      const common = { ludo, site: null, timeZone: 'Europe/Zurich' }
      return String(url).endsWith('/activities/jeux-gouter') ? response({ ...common, activity: { ...activity, bodyMarkdown: 'Jeux à Sécheron.', supportImage: null, supportImages: [], attachments: [], registration: { enabled: false, capacity: null, isAtCapacity: false, fullMessage: null } } }) : response({ ...common, activities: [activity, { ...activity, id: 'preados-id', slug: 'preados', title: 'Préados', sites: [paquis] }] })
    }) })
    expect((await loadActivities(false, client)).items.map((item) => item.location)).toEqual(['Sécheron', 'Pâquis'])
    expect((await loadActivityDetail('jeux-gouter', client))?.item.location).toBe('Sécheron')
  })
  it('conserve une précision de lieu et distingue la publication et son auteur', async () => {
    const client = createLudoHubClient({ baseUrl: 'https://hub.test', fetch: vi.fn<typeof fetch>().mockImplementation(async (url) => String(url).endsWith('/news')
      ? response({ ludo, site: null, news: [{ id: 'news-id', slug: 'nouvelle', title: 'Nouvelle', summary: '', image: null, publishedAt, authorName: 'Alessia' }] })
      : response({ ludo, site: null, timeZone: 'Europe/Zurich', activities: [{ ...activity, location: 'Dans le hall' }] })) })
    expect((await loadNews(client)).items[0].authorName).toBe('Alessia')
    expect((await loadActivities(false, client)).items[0].location).toBe('Sécheron · Dans le hall')
  })
  it('n’annonce pas les deux lieux quand Hub ne publie plus aucun lieu actif pour une activité', async () => {
    const client = createLudoHubClient({ baseUrl: 'https://hub.test', fetch: vi.fn<typeof fetch>().mockImplementation(async (url) => {
      const common = { ludo, site: null, timeZone: 'Europe/Zurich' }
      return String(url).endsWith('/activities/jeux-gouter')
        ? response({ ...common, activity: { ...activity, sites: [], bodyMarkdown: 'Activité à confirmer.', supportImage: null, supportImages: [], attachments: [], registration: { enabled: false, capacity: null, isAtCapacity: false, fullMessage: null } } })
        : response({ ...common, activities: [{ ...activity, sites: [] }, { ...activity, id: 'outside-id', slug: 'hors-les-murs', sites: [], location: 'Parc du quartier' }] })
    }) })
    expect((await loadActivities(false, client)).items.map((item) => item.location)).toEqual(['Lieu non publié', 'Parc du quartier'])
    expect((await loadActivityDetail('jeux-gouter', client))?.item.location).toBe('Lieu non publié')
  })
  it('transmet la photo et l’information importante d’un lieu sans modifier ses horaires', async () => {
    const photo = { url: 'https://images.test/secheron.webp', alt: 'Entrée de Sécheron' }
    const client = createLudoHubClient({ baseUrl: 'https://hub.test', fetch: vi.fn<typeof fetch>().mockResolvedValue(response({ ludo, sites: [{ ...secheron, address: 'Rue Anne-Torcapel 2', postalCode: '1202', city: 'Genève', phone: null, email: null, accessInfo: null, importantInfo: 'Fermeture le 20 octobre.', photo, directionsUrl: null, latitude: null, longitude: null, isPrimary: true, sortOrder: 0, openingIntervals: [{ dayOfWeek: 2, opensAt: '16:00', closesAt: '18:30' }] }] })) })
    const places = await loadPracticalPlaces(client)
    expect(places.source).toBe('live')
    expect(places.data[0]).toMatchObject({ photo, importantInfo: 'Fermeture le 20 octobre.', schedule: [{ day: 'Mardi', hours: '16h–18h30' }] })
    expect(places.data[0].directionsUrl).toContain('google.com/maps/dir/')
  })
})
