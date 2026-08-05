import { ludohub, type Announcement, type LudoHubClient } from '../lib/ludohub'
import {
  loadActivities,
  loadNews,
  loadTopThrees,
  type ActivityView,
  type EditorialCollection,
  type NewsView,
  type TopThreeView,
} from './editorial'
import {
  loadPracticalPlaces,
  type PracticalApi,
  type PracticalCollection,
  type PracticalPlace,
} from './practical'

export type HomepageAnnouncements = {
  source: 'live' | 'empty' | 'unavailable'
  items: Announcement[]
}

export type HomepageData = {
  places: PracticalCollection<PracticalPlace>
  announcements: HomepageAnnouncements
  news: EditorialCollection<NewsView>
  activities: EditorialCollection<ActivityView>
  topThrees: EditorialCollection<TopThreeView>
  selectedTopThree: TopThreeView | null
  featuredActivities: ActivityView[]
  noindex: boolean
  demoNotice: string | null
}

type HomepageClient = LudoHubClient & PracticalApi

async function loadAnnouncements(
  client: LudoHubClient,
): Promise<HomepageAnnouncements> {
  const result = await client.announcements()
  if (result.source === 'live') {
    return { source: 'live', items: result.data.announcements }
  }
  return {
    source: result.source === 'empty' ? 'empty' : 'unavailable',
    items: [],
  }
}

export async function loadHomepageData(
  client: HomepageClient = ludohub,
): Promise<HomepageData> {
  const [places, announcements, news, activities, topThrees] =
    await Promise.all([
      loadPracticalPlaces(client),
      loadAnnouncements(client),
      loadNews(client),
      loadActivities(false, client),
      loadTopThrees(client),
    ])

  const selectedTopThree =
    topThrees.mode === 'live'
      ? topThrees.items.find((item) => item.isHomepage) ?? null
      : topThrees.items.find((item) => item.isHomepage) ??
        topThrees.items[0] ??
        null
  const featuredActivities =
    activities.mode === 'live'
      ? activities.items
          .filter((item) => item.featuredRank !== null)
          .sort((a, b) => a.featuredRank! - b.featuredRank!)
          .slice(0, 3)
      : activities.items.slice(0, 3)
  const usesDemo =
    places.source === 'fallback' ||
    news.mode === 'demo' ||
    activities.mode === 'demo' ||
    topThrees.mode === 'demo'

  return {
    places,
    announcements,
    news: { ...news, items: news.items.slice(0, 3) },
    activities,
    topThrees,
    selectedTopThree,
    featuredActivities,
    noindex: usesDemo,
    demoNotice: usesDemo
      ? 'Mode démonstration : certaines informations viennent des archives et doivent être confirmées avant publication.'
      : null,
  }
}
