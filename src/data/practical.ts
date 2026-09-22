import { ludohub } from '../lib/ludohub/index.js'
import type { LudoHubClient } from '../lib/ludohub/client.js'
import type { DirectoryEntry, DirectoryPayload, Faq, FaqsPayload, LudoHubFailureReason, LudoSite, SitesPayload } from '../lib/ludohub/types.js'

export type PlaceKey = 'paquis' | 'secheron'
export type PracticalSource = 'live' | 'fallback' | 'empty'
export type PracticalCollection<T> = { source: PracticalSource; data: T[]; reason?: LudoHubFailureReason }

export type PracticalPlace = {
  key: PlaceKey
  name: string
  shortName: string
  question: string
  introduction: string
  address: string
  transit: string
  directionsUrl: string
  phone: string | null
  email: string | null
  schedule: Array<{ day: string; hours: string }>
  arrival: string[]
}

/** Contenu repris des archives, en attente de validation par l'équipe. */
export const practicalStatus = {
  label: 'Informations provisoires',
  note: 'Ces informations viennent de l’ancien site et doivent encore être confirmées par l’équipe avant publication.',
  verified: false,
} as const

export const practicalPlaces: Record<PlaceKey, PracticalPlace> = {
  paquis: {
    key: 'paquis',
    name: 'Ludothèque des Pâquis',
    shortName: 'Pâquis',
    question: 'Quand puis-je venir à la ludothèque des Pâquis ?',
    introduction: 'Retrouvez ici l’adresse, les horaires et ce qu’il faut savoir avant de venir jouer ou emprunter un jeu.',
    address: 'Rue de Berne 50, 1201 Genève',
    transit: 'Bus 1 et 25 · arrêt Navigation',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Rue%20de%20Berne%2050%2C%201201%20Gen%C3%A8ve',
    phone: '+41 22 731 20 09',
    email: 'lu.paquissecheron@fase.ch',
    schedule: [
      { day: 'Lundi', hours: '9h30–11h30' },
      { day: 'Mardi', hours: '16h30–18h30' },
      { day: 'Mercredi', hours: '9h30–11h30 · 14h30–17h30' },
      { day: 'Jeudi', hours: '9h30–11h30 · 16h30–18h30' },
      { day: 'Samedi', hours: '9h–12h' },
    ],
    arrival: ['Les enfants restent sous la responsabilité de l’adulte qui les accompagne.', 'Pour un premier emprunt, demandez à l’équipe les modalités d’inscription.', 'En cas de doute sur une ouverture, téléphonez avant de vous déplacer.'],
  },
  secheron: {
    key: 'secheron',
    name: 'Ludothèque de Sécheron',
    shortName: 'Sécheron',
    question: 'Quand puis-je venir à la ludothèque de Sécheron ?',
    introduction: 'Retrouvez ici l’adresse, les horaires et ce qu’il faut savoir avant de venir jouer ou rendre un jeu.',
    address: 'Rue Anne Torcapel 2, 1202 Genève',
    transit: 'Tram 15 · arrêts Butini ou Maison de la Paix',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Rue%20Anne%20Torcapel%202%2C%201202%20Gen%C3%A8ve',
    phone: '+41 22 731 94 65',
    email: 'lu.paquissecheron@fase.ch',
    schedule: [
      { day: 'Mardi', hours: '16h–18h30' },
      { day: 'Mercredi', hours: '9h30–11h30 · 14h30–17h30' },
      { day: 'Samedi', hours: '9h–10h30 · prêts et retours' },
    ],
    arrival: ['Les enfants restent sous la responsabilité de l’adulte qui les accompagne.', 'Le samedi matin est indiqué pour les prêts et les retours.', 'En cas de doute sur une ouverture, téléphonez avant de vous déplacer.'],
  },
}

const fallbackLudo = { slug: 'paquis-secheron', name: 'Pâquis-Sécheron' }
const fallbackArrival: Record<PlaceKey, string[]> = {
  paquis: practicalPlaces.paquis.arrival,
  secheron: practicalPlaces.secheron.arrival,
}

export const fallbackSitesPayload: SitesPayload = {
  ludo: fallbackLudo,
  sites: [
    {
      id: 'legacy-paquis', slug: 'paquis', name: practicalPlaces.paquis.name,
      address: 'Rue de Berne 50', postalCode: '1201', city: 'Genève',
      phone: practicalPlaces.paquis.phone, email: practicalPlaces.paquis.email,
      accessInfo: practicalPlaces.paquis.transit, latitude: null, longitude: null,
      isPrimary: true, sortOrder: 0,
      openingIntervals: [
        { dayOfWeek: 1, opensAt: '09:30', closesAt: '11:30' },
        { dayOfWeek: 2, opensAt: '16:30', closesAt: '18:30' },
        { dayOfWeek: 3, opensAt: '09:30', closesAt: '11:30' },
        { dayOfWeek: 3, opensAt: '14:30', closesAt: '17:30' },
        { dayOfWeek: 4, opensAt: '09:30', closesAt: '11:30' },
        { dayOfWeek: 4, opensAt: '16:30', closesAt: '18:30' },
        { dayOfWeek: 6, opensAt: '09:00', closesAt: '12:00' },
      ],
    },
    {
      id: 'legacy-secheron', slug: 'secheron', name: practicalPlaces.secheron.name,
      address: 'Rue Anne Torcapel 2', postalCode: '1202', city: 'Genève',
      phone: practicalPlaces.secheron.phone, email: practicalPlaces.secheron.email,
      accessInfo: practicalPlaces.secheron.transit, latitude: null, longitude: null,
      isPrimary: false, sortOrder: 1,
      openingIntervals: [
        { dayOfWeek: 2, opensAt: '16:00', closesAt: '18:30' },
        { dayOfWeek: 3, opensAt: '09:30', closesAt: '11:30' },
        { dayOfWeek: 3, opensAt: '14:30', closesAt: '17:30' },
        { dayOfWeek: 6, opensAt: '09:00', closesAt: '10:30' },
      ],
    },
  ],
}

export const fallbackFaqsPayload: FaqsPayload = {
  ludo: fallbackLudo,
  site: null,
  faqs: [
    { id: 'legacy-children', question: 'Les enfants peuvent-ils venir seuls ?', answerMarkdown: 'Les informations archivées indiquent que les enfants restent sous la responsabilité de l’adulte qui les accompagne. Demandez à l’équipe les règles selon l’âge.', category: 'Visite', sortOrder: 0 },
    { id: 'legacy-booking', question: 'Faut-il réserver pour jouer sur place ?', answerMarkdown: 'Aucune réservation générale n’est annoncée dans les données disponibles. Pour un groupe ou une institution, contactez l’équipe avant de venir.', category: 'Visite', sortOrder: 1 },
    { id: 'legacy-return', question: 'Puis-je rendre un jeu dans l’autre ludothèque ?', answerMarkdown: 'Ce point n’est pas confirmé. Appelez le lieu où vous avez emprunté le jeu avant de vous déplacer.', category: 'Emprunt', sortOrder: 2 },
    { id: 'legacy-holidays', question: 'Les horaires changent-ils pendant les vacances ?', answerMarkdown: 'Des fermetures ou horaires spéciaux sont possibles. Vérifiez les informations récentes ou téléphonez avant votre visite.', category: 'Horaires', sortOrder: 3 },
  ],
}

export const fallbackDirectoryPayload: DirectoryPayload = {
  ludo: fallbackLudo,
  entries: fallbackSitesPayload.sites.map((site, index) => ({
    id: site.id,
    slug: site.slug,
    name: site.name,
    descriptionMarkdown: site.accessInfo,
    address: site.address,
    postalCode: site.postalCode,
    city: site.city ?? 'Genève',
    phone: site.phone,
    email: site.email,
    website: null,
    directionsUrl: `https://www.openstreetmap.org/search?query=${encodeURIComponent([site.address, site.postalCode, site.city].filter(Boolean).join(' '))}`,
    officialUrl: null,
    sortOrder: index,
  })),
}

export type PracticalApi = Pick<LudoHubClient, 'sites' | 'faqs' | 'directory'>

const dayNames = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

export const formatOpeningTime = (value: string) => {
  const [hour, minute] = value.split(':')
  return `${Number(hour)}h${minute === '00' ? '' : minute}`
}

export function formatOpeningIntervals(intervals: LudoSite['openingIntervals']) {
  const grouped = new Map<number, string[]>()
  for (const interval of [...intervals].sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.opensAt.localeCompare(b.opensAt))) {
    const ranges = grouped.get(interval.dayOfWeek) ?? []
    ranges.push(`${formatOpeningTime(interval.opensAt)}–${formatOpeningTime(interval.closesAt)}`)
    grouped.set(interval.dayOfWeek, ranges)
  }
  return [...grouped].map(([day, ranges]) => ({ day: dayNames[day] ?? `Jour ${day}`, hours: ranges.join(' · ') }))
}

function mapSite(site: LudoSite, source: Exclude<PracticalSource, 'empty'>): PracticalPlace | null {
  if (site.slug !== 'paquis' && site.slug !== 'secheron') return null
  const knownKey = site.slug
  const locality = [site.postalCode, site.city].filter(Boolean).join(' ')
  const address = [site.address, locality].filter(Boolean).join(', ')
  const destination =
    site.latitude !== null && site.longitude !== null
      ? `${site.latitude},${site.longitude}`
      : address || site.name
  return {
    key: knownKey,
    name: site.name,
    shortName: site.name.replace(/^Ludothèque (des |de )?/i, ''),
    question: `Quels sont les horaires de ${site.name} ?`,
    introduction: 'Retrouvez ici l’adresse, les horaires et les coordonnées actuellement publiés.',
    address: address || 'Adresse non publiée',
    transit: site.accessInfo ?? 'Accès non publié',
    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`,
    phone: site.phone,
    email: site.email,
    schedule: formatOpeningIntervals(site.openingIntervals),
    arrival: source === 'fallback' ? fallbackArrival[knownKey] : [],
  }
}

export async function loadPracticalPlaces(api: PracticalApi = ludohub): Promise<PracticalCollection<PracticalPlace>> {
  const result = await api.sites({ fallback: fallbackSitesPayload })
  if (result.source === 'live') {
    const places = result.data.sites.map((site) => mapSite(site, 'live')).filter((place): place is PracticalPlace => place !== null)
    return places.length ? { source: 'live', data: places } : { source: 'empty', data: [] }
  }
  if (result.source === 'fallback') return { source: 'fallback', data: result.data.sites.map((site) => mapSite(site, 'fallback')).filter((place): place is PracticalPlace => place !== null), reason: result.reason }
  return { source: 'fallback', data: fallbackSitesPayload.sites.map((site) => mapSite(site, 'fallback')).filter((place): place is PracticalPlace => place !== null), reason: result.reason }
}

export async function loadPracticalFaqs(api: PracticalApi = ludohub): Promise<PracticalCollection<Faq>> {
  const result = await api.faqs({ fallback: fallbackFaqsPayload, limit: 200 })
  if (result.source === 'live') return result.data.faqs.length ? { source: 'live', data: result.data.faqs } : { source: 'empty', data: [] }
  if (result.source === 'fallback') return { source: 'fallback', data: result.data.faqs, reason: result.reason }
  return { source: 'fallback', data: fallbackFaqsPayload.faqs, reason: result.reason }
}

export async function loadPracticalDirectory(api: PracticalApi = ludohub): Promise<PracticalCollection<DirectoryEntry>> {
  const result = await api.directory({ fallback: fallbackDirectoryPayload, limit: 200 })
  if (result.source === 'live') return result.data.entries.length ? { source: 'live', data: result.data.entries } : { source: 'empty', data: [] }
  if (result.source === 'fallback') return { source: 'fallback', data: result.data.entries, reason: result.reason }
  return { source: 'fallback', data: fallbackDirectoryPayload.entries, reason: result.reason }
}

export const practicalLinks = [
  { href: '/infos-pratiques/fonctionnement', label: 'Comment ça marche ?', description: 'Jeu sur place, emprunts et retours.', icon: 'arrows-clockwise' },
  { href: '/infos-pratiques/inscription', label: 'Comment s’inscrire ?', description: 'Les étapes à prévoir avant un premier emprunt.', icon: 'identification-card' },
  { href: '/infos-pratiques/faq', label: 'Questions fréquentes', description: 'Les réponses rapides avant de venir.', icon: 'question' },
  { href: '/infos-pratiques/annuaire', label: 'Qui contacter ?', description: 'Les coordonnées des deux lieux.', icon: 'address-book' },
] as const
