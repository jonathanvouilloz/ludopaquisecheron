import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { practicalLinks, practicalPlaces, practicalStatus } from '../src/data/practical'
import { primaryNavigation } from '../src/data/site'

const read = (path: string) => readFile(new URL(path, import.meta.url), 'utf8')

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
    expect(paquis).toContain('practicalPlaces.paquis')
    expect(secheron).toContain('practicalPlaces.secheron')
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

  it('rend le formulaire de contact explicitement inactif avec des solutions de repli', async () => {
    const contact = await read('../src/pages/contact.astro')
    expect(contact).toContain('Ce formulaire n’envoie pas encore de message')
    expect(contact).toContain('type="button" disabled')
    expect(contact).toContain('name="recipient"')
    expect(contact).toContain('value="general"')
    expect(contact).toContain('name="phone"')
    expect(contact).toContain('name="subject"')
    expect(contact).not.toContain('type="file"')
    expect(contact).toContain('mailto:lu.paquissecheron@fase.ch')
    expect(contact).toContain('tel:')
  })
})
