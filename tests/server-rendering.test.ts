import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

const projectFile = (path: string) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

describe('rendu public à la demande', () => {
  it('configure Astro pour le rendu serveur Vercel', async () => {
    const config = await projectFile('astro.config.mjs')

    expect(config).toContain("output: 'server'")
    expect(config).toContain("import vercel from '@astrojs/vercel'")
    expect(config).toContain('adapter: vercel()')
  })

  it.each([
    'src/pages/actualites/[slug].astro',
    'src/pages/activites/[slug].astro',
  ])('charge %s avec le slug demandé, sans liste figée au build', async (path) => {
    const page = await projectFile(path)

    expect(page).toContain('Astro.params.slug')
    expect(page).not.toContain('getStaticPaths')
  })
})
