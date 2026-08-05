import { describe, expect, it } from 'vitest'
import { ageGroups, navigation, locations, featuredGames } from '../src/data/site'

describe('contenu statique initial', () => {
  it('garde une navigation courte et orientée visiteurs', () => {
    expect(navigation.map((item) => item.label)).toEqual([
      'Accueil',
      'Jeux par âge',
      'Actualités',
      'Activités',
      'La ludothèque',
      'Infos pratiques',
    ])
  })

  it('distingue les deux lieux physiques', () => {
    expect(locations.map((location) => location.key)).toEqual(['paquis', 'secheron'])
    expect(locations.every((location) => location.address.length > 0)).toBe(true)
    expect(locations.every((location) => location.schedule.every((slot) => slot.day && slot.hours))).toBe(true)
  })

  it('présente des groupes d’âge ordonnés sans en faire un catalogue exhaustif', () => {
    expect(ageGroups).toHaveLength(4)
    expect(ageGroups.map((group) => group.range)).toEqual(['0–3 ans', '4–6 ans', '7–9 ans', '10 ans et +'])
  })

  it('limite chaque sélection éditoriale à trois jeux', () => {
    const counts = new Map<string, number>()
    for (const game of featuredGames) {
      counts.set(game.ageGroup, (counts.get(game.ageGroup) ?? 0) + 1)
    }
    expect([...counts.values()].every((count) => count <= 3)).toBe(true)
  })
})
