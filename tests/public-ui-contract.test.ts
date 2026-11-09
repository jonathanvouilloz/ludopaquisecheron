import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

const read = (path: string) => readFile(new URL(`../src/${path}`, import.meta.url), 'utf8')

describe('présentation publique accessible et proportions des médias', () => {
  it('réutilise le logo officiel et relie les actions aux coordonnées et horaires existants', async () => {
    const [header, home, css] = await Promise.all([read('components/Header.astro'), read('pages/index.astro'), read('styles/global.css')])
    expect(header).toContain('src="/images/logo-paquis-secheron.gif"')
    expect(header).toContain('href="/contact#contact-direct"')
    expect(home).toContain('href="#infos-pratiques"')
    expect(home).toContain('id="infos-pratiques"')
    expect(css).toContain('scroll-padding-top: 7rem')
    expect(header).not.toContain('data-ludo-switch')
  })

  it('préserve les proportions de chaque photo publiée et superpose les légendes de galerie', async () => {
    const [gallery, team, committee, location, css] = await Promise.all([
      read('pages/galerie.astro'), read('pages/association/equipe.astro'), read('pages/association/comite.astro'),
      read('components/LocationCard.astro'), read('styles/global.css'),
    ])
    for (const profiles of [team, committee]) {
      expect(profiles).toContain('height: auto')
      expect(profiles).not.toContain('aspect-ratio')
      expect(profiles).not.toContain('object-fit: cover')
    }
    expect(gallery).toMatch(/\.gallery-item img\s*\{[^}]*height:\s*auto/)
    expect(gallery).toContain('columns: 3')
    expect(gallery).toContain('columns: 2')
    expect(gallery).toContain('columns: 1')
    expect(gallery).toContain('break-inside: avoid')
    expect(gallery).toMatch(/figcaption\s*\{[^}]*position:\s*absolute[^}]*bottom:[^}]*left:/)
    expect(location).toContain('location.photo.url')
    expect(location).toContain('location.importantInfo')
    expect(css).toMatch(/\.location-photo\s*\{[^}]*height:\s*auto/)
  })

  it('distingue la publication des actualités des dates d’événement', async () => {
    const [detail, list, home] = await Promise.all([read('pages/actualites/[slug].astro'), read('pages/actualites/index.astro'), read('pages/index.astro')])
    expect(detail).toContain('Publié le {item.dateLabel} par {item.authorName')
    expect(detail).not.toContain('<dt>Date</dt>')
    expect(detail).not.toContain('detail-aside')
    for (const cards of [list, home]) expect(cards).toContain('`Publié le ${item.dateLabel}`')
  })

  it('garde les interactions locales et réinitialise les composants après navigation Astro', async () => {
    const [faq, header, layout, css] = await Promise.all([read('pages/infos-pratiques/faq.astro'), read('components/Header.astro'), read('layouts/BaseLayout.astro'), read('styles/global.css')])
    expect(layout).toContain('<ClientRouter />')
    expect(header).toContain('astro:before-swap')
    expect(header).toContain('controller.abort()')
    expect(header).toContain("event.key === 'Escape'")
    expect(header).toContain('astro:page-load')
    expect(faq).toContain('astro:page-load')
    expect(faq).toContain('name="questions-ludotheque"')
    expect(faq).toContain('{faq.answerText}')
    expect(faq).not.toContain('open={')
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
  })
})
