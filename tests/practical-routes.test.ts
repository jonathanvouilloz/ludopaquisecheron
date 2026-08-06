import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import {
  fallbackFaqsPayload,
  fallbackSitesPayload,
  formatOpeningIntervals,
  loadPracticalFaqs,
  loadPracticalDirectory,
  loadPracticalPlaces,
  practicalLinks,
  practicalPlaces,
  practicalStatus,
} from '../src/data/practical'
import { primaryNavigation } from '../src/data/site'
import { createLudoHubClient } from '../src/lib/ludohub/client'
import { publicContactEndpoint, publicMembershipFormUrl, readLudoHubConfig } from '../src/lib/ludohub/config'

const read = (path: string) => readFile(new URL(path, import.meta.url), 'utf8')
const envelope = (data: unknown) => new Response(JSON.stringify({ version: 1, data }), { status: 200, headers: { 'content-type': 'application/json' } })

describe('shell multipage et parcours pratiques', () => {
  it('relie les destinations principales avec une navigation courte', () => {
    expect(primaryNavigation.map(({ href }) => href)).toEqual([
      '/paquis',
      '/secheron',
      '/actualites',
      '/infos-pratiques',
      '/contact',
    ])
  })

  it('force le thème du lieu sans écraser le choix persistant', async () => {
    const baseLayout = await read('../src/layouts/BaseLayout.astro')
    const header = await read('../src/components/Header.astro')
    const paquis = await read('../src/pages/paquis.astro')
    const secheron = await read('../src/pages/secheron.astro')

    expect(baseLayout).toContain('data-theme-locked')
    expect(baseLayout).toContain('const forcedTheme = document.documentElement.dataset.themeLocked;')
    expect(header).toContain('if (!lockedTheme)')
    expect(header).toContain('button.disabled = true')
    expect(paquis).toContain("item.key === 'paquis'")
    expect(secheron).toContain("item.key === 'secheron'")
    expect(paquis).toContain('placeKey="paquis"')
    expect(secheron).toContain('placeKey="secheron"')
  })

  it('sépare les données pratiques et signale leur statut provisoire', () => {
    expect(practicalStatus.verified).toBe(false)
    expect(practicalStatus.label).toBe('Informations provisoires')
    expect(Object.keys(practicalPlaces)).toEqual(['paquis', 'secheron'])
    expect(Object.values(practicalPlaces).every((place) => place.schedule.length > 0)).toBe(true)
    expect(practicalLinks).toHaveLength(4)
  })

  it('commence chaque nouvelle page par une question concrète', async () => {
    const pages = await Promise.all([
      read('../src/pages/infos-pratiques/index.astro'),
      read('../src/pages/infos-pratiques/fonctionnement.astro'),
      read('../src/pages/infos-pratiques/inscription.astro'),
      read('../src/pages/infos-pratiques/faq.astro'),
      read('../src/pages/infos-pratiques/annuaire.astro'),
      read('../src/pages/contact.astro'),
    ])

    for (const page of pages) {
      expect(page).toContain('<QuestionHero')
      expect(page).toMatch(/question="[^"]+\?"/)
    }
  })

  it('active le formulaire uniquement avec une URL publique et garde les solutions de repli', async () => {
    const contact = await read('../src/pages/contact.astro')
    expect(contact).toContain('publicContactEndpoint()')
    expect(contact).toContain('data-contact-endpoint={contactEndpoint ?? undefined}')
    expect(contact).toContain('disabled={!contactEndpoint}')
    expect(contact).toContain('name="recipient"')
    expect(contact).toContain('value="general"')
    expect(contact).toContain('name="phone"')
    expect(contact).toContain('name="subject"')
    expect(contact).toContain('name="website"')
    expect(contact).not.toContain('type="file"')
    expect(contact).toContain('Idempotency-Key')
    expect(contact).toContain('idempotencyKey ??= crypto.randomUUID()')
    expect(contact).toContain('response.status === 400')
    expect(contact).toContain('response.status === 429')
    expect(contact).toContain('response.status === 200 || response.status === 201')
    expect(contact).toContain("receipt.accepted === true")
    expect(contact).toContain("typeof receipt.receiptId === 'string'")
    expect(contact).not.toContain('if (response.ok)')
    expect(contact).not.toContain('console.')
    expect(contact).toContain('mailto:')
    expect(contact).toContain('tel:')
  })

  it('désindexe chaque page pratique lorsqu’elle affiche le fallback', async () => {
    const layout = await read('../src/layouts/PracticalLayout.astro')
    const location = await read('../src/components/LocationPage.astro')
    const dynamicPages = await Promise.all([
      read('../src/pages/contact.astro'),
      read('../src/pages/infos-pratiques/index.astro'),
      read('../src/pages/infos-pratiques/faq.astro'),
      read('../src/pages/infos-pratiques/annuaire.astro'),
    ])
    const provisionalPages = await Promise.all([
      read('../src/pages/infos-pratiques/fonctionnement.astro'),
      read('../src/pages/infos-pratiques/inscription.astro'),
    ])

    expect(layout).toContain('noindex?: boolean')
    expect(layout).toContain('noindex={noindex}')
    expect(location).toContain("noindex={source === 'fallback'}")
    for (const page of dynamicPages) {
      expect(page).toMatch(/noindex=\{\w+Result\.source === 'fallback'\}/)
    }
    for (const page of provisionalPages) {
      expect(page).toMatch(/<PracticalLayout[^>]+\snoindex>/)
    }
  })

  it('propose uniquement la source LudoHub valide pour l’adhésion familiale', async () => {
    const page = await read('../src/pages/infos-pratiques/inscription.astro')
    expect(page).toContain('publicMembershipFormUrl()')
    expect(page).toMatch(/membershipFormUrl\s*\?\s*<a/)
    expect(page).toContain('target="_blank"')
    expect(page).toContain('rel="noopener noreferrer"')
    expect(page).toContain('Formulaire temporairement indisponible')
    expect(page).toContain('href="/contact"')
    expect(page).toContain('par TWINT ou en espèces')
    expect(page).toContain('Aucun paiement n’est demandé en ligne')
    expect(page).toContain('Aucun compte en ligne n’est nécessaire')
    expect(page).toContain('avec leur version')
    expect(page).not.toContain('<iframe')
    expect(page).not.toMatch(/href=\{membershipFormUrl \?\? ['"]{2}\}/)

    expect(publicMembershipFormUrl(readLudoHubConfig({
      LUDOHUB_PUBLIC_API_BASE: 'https://ludohub.example',
    }))).toBe('https://ludohub.example/formulaires/paquis-secheron/adhesion')
    expect(publicMembershipFormUrl(readLudoHubConfig({
      LUDOHUB_PUBLIC_API_BASE: 'not-a-url',
    }))).toBeNull()
  })

  it('utilise exclusivement les sites live et ignore les slugs inconnus', async () => {
    const payload = {
      ...fallbackSitesPayload,
      sites: [
        { ...fallbackSitesPayload.sites[0], name: 'Nom API Pâquis', phone: '+41 22 000 00 01' },
        { ...fallbackSitesPayload.sites[0], id: 'third', slug: 'autre-site', name: 'Troisième site' },
      ],
    }
    const client = createLudoHubClient({ baseUrl: 'https://ludohub.example', fetch: async () => envelope(payload) })
    await expect(loadPracticalPlaces(client)).resolves.toMatchObject({
      source: 'live',
      data: [{ key: 'paquis', name: 'Nom API Pâquis', phone: '+41 22 000 00 01', arrival: [] }],
    })
  })

  it('respecte un résultat live vide sans injecter le fallback', async () => {
    const client = createLudoHubClient({
      baseUrl: 'https://ludohub.example',
      fetch: async () => envelope({ ...fallbackSitesPayload, sites: [] }),
    })
    await expect(loadPracticalPlaces(client)).resolves.toEqual({ source: 'empty', data: [] })
  })

  it('respecte aussi les états live et empty de la FAQ et de l’annuaire', async () => {
    const client = createLudoHubClient({
      baseUrl: 'https://ludohub.example',
      fetch: async (input) => {
        const pathname = new URL(String(input)).pathname
        if (pathname.endsWith('/faqs')) return envelope({ ...fallbackFaqsPayload, faqs: [] })
        return envelope({
          ludo: fallbackSitesPayload.ludo,
          entries: [{
            id: 'api-contact', slug: 'partenaire', name: 'Contact API', descriptionMarkdown: null,
            address: null, postalCode: null, city: 'Genève', phone: '+41 22 000 00 02', email: null,
            website: null, directionsUrl: 'https://example.test/directions', officialUrl: 'https://example.test', sortOrder: 0,
          }],
        })
      },
    })
    await expect(loadPracticalFaqs(client)).resolves.toEqual({ source: 'empty', data: [] })
    await expect(loadPracticalDirectory(client)).resolves.toMatchObject({ source: 'live', data: [{ name: 'Contact API' }] })
  })

  it('utilise le fallback entier et conserve la raison si LudoHub manque ou échoue', async () => {
    const absent = createLudoHubClient({ baseUrl: '' })
    await expect(loadPracticalPlaces(absent)).resolves.toMatchObject({ source: 'fallback', reason: 'not_configured' })

    const unavailable = createLudoHubClient({
      baseUrl: 'https://ludohub.example',
      fetch: async () => new Response(null, { status: 503 }),
    })
    await expect(loadPracticalFaqs(unavailable)).resolves.toEqual({
      source: 'fallback',
      data: fallbackFaqsPayload.faqs,
      reason: 'http_error',
    })
  })

  it('rend les jours ISO et heures en français', () => {
    expect(formatOpeningIntervals([
      { dayOfWeek: 3, opensAt: '14:30', closesAt: '17:30' },
      { dayOfWeek: 1, opensAt: '09:00', closesAt: '12:00' },
      { dayOfWeek: 3, opensAt: '09:30', closesAt: '11:30' },
    ])).toEqual([
      { day: 'Lundi', hours: '9h–12h' },
      { day: 'Mercredi', hours: '9h30–11h30 · 14h30–17h30' },
    ])
  })

  it('n’expose un endpoint de contact que lorsque la base publique est valide', () => {
    expect(publicContactEndpoint(readLudoHubConfig({ LUDOHUB_PUBLIC_API_BASE: '' }))).toBeNull()
    expect(publicContactEndpoint(readLudoHubConfig({ LUDOHUB_PUBLIC_API_BASE: 'https://ludohub.example' }))).toBe(
      'https://ludohub.example/api/public/contact/v1/paquis-secheron',
    )
  })
})
