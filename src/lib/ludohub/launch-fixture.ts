const ludo = { slug: 'paquis-secheron', name: 'Pâquis-Sécheron — fixture de lancement' }
const sites = [
  { id: 'fixture-paquis', slug: 'paquis', name: 'Pâquis — fixture', address: null, postalCode: null, city: null, phone: null, email: null, accessInfo: null, latitude: null, longitude: null, isPrimary: true, sortOrder: 0, openingIntervals: [] },
  { id: 'fixture-secheron', slug: 'secheron', name: 'Sécheron — fixture', address: null, postalCode: null, city: null, phone: null, email: null, accessInfo: null, latitude: null, longitude: null, isPrimary: false, sortOrder: 1, openingIntervals: [] },
]

/** Fixture vide mais structurellement live, réservée au test local de la chaîne de lancement. */
export const launchFixtureFetch: typeof globalThis.fetch = async (input) => {
  const url = new URL(String(input))
  const section = url.searchParams.get('section')
  const pathname = url.pathname
  let data: Record<string, unknown>
  if (pathname.endsWith('/sites')) data = { ludo, sites }
  else if (pathname.endsWith('/announcements')) data = { ludo, site: null, announcements: [] }
  else if (pathname.endsWith('/news')) data = { ludo, site: null, news: [] }
  else if (pathname.endsWith('/activities') || pathname.endsWith('/activities/archive')) data = { ludo, site: null, timeZone: 'Europe/Zurich', activities: [] }
  else if (pathname.endsWith('/top-threes')) data = { ludo, site: null, topThrees: [] }
  else if (pathname.endsWith('/faqs')) data = { ludo, site: null, faqs: [] }
  else if (pathname.endsWith('/documents')) data = { ludo, site: null, documents: [] }
  else if (pathname.endsWith('/gallery')) data = { ludo, site: null, images: [] }
  else if (pathname.endsWith('/profiles')) data = { ludo, site: null, section: section === 'team' || section === 'committee' ? section : null, profiles: [] }
  else if (pathname.endsWith('/directory')) data = { ludo, entries: [] }
  else return new Response(null, { status: 404 })
  return new Response(JSON.stringify({ version: 1, data }), { status: 200, headers: { 'content-type': 'application/json' } })
}
