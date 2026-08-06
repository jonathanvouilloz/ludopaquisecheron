import { loadHomepageData } from './home'
import {
  loadActivityRoutes,
  loadDocuments,
  loadGallery,
  loadNewsRoutes,
  loadProfiles,
  loadTopThrees,
} from './editorial'
import { loadPracticalDirectory, loadPracticalFaqs, loadPracticalPlaces } from './practical'

export async function loadIndexableRoutes(): Promise<string[]> {
  const [home, places, faqs, directory, news, activities, topThrees, gallery, team, committee, documents] = await Promise.all([
    loadHomepageData(),
    loadPracticalPlaces(),
    loadPracticalFaqs(),
    loadPracticalDirectory(),
    loadNewsRoutes(),
    loadActivityRoutes(),
    loadTopThrees(),
    loadGallery(),
    loadProfiles('team'),
    loadProfiles('committee'),
    loadDocuments(),
  ])

  const routes = new Set<string>(['/association'])
  if (!home.noindex) routes.add('/')
  if (places.source !== 'fallback') {
    routes.add('/infos-pratiques')
    routes.add('/contact')
    for (const place of places.data) routes.add(`/${place.key}`)
  }
  if (faqs.source !== 'fallback') routes.add('/infos-pratiques/faq')
  if (directory.source !== 'fallback') routes.add('/infos-pratiques/annuaire')
  if (news.mode === 'live') {
    routes.add('/actualites')
    for (const item of news.items.filter((item) => item.detailAvailable)) routes.add(`/actualites/${item.slug}`)
  }
  if (activities.mode === 'live') {
    routes.add('/activites')
    routes.add('/activites/archives')
    for (const item of activities.items.filter((item) => item.detailAvailable)) routes.add(`/activites/${item.slug}`)
  }
  if (topThrees.mode === 'live') routes.add('/top-3')
  if (gallery.mode === 'live') routes.add('/galerie')
  if (team.mode === 'live') routes.add('/association/equipe')
  if (committee.mode === 'live') routes.add('/association/comite')
  if (documents.mode === 'live') {
    routes.add('/association/mission')
    routes.add('/association/documents')
  }
  return [...routes].sort()
}
