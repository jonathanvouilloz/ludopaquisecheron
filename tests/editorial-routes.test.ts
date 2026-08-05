import { access, readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
  activities,
  archivedActivities,
  committee,
  news,
  topGames,
} from "../src/data/editorial";
import { discoverNavigation, primaryNavigation } from "../src/data/site";

const root = new URL("../src/pages/", import.meta.url);
const read = (path: string) => readFile(new URL(path, root), "utf8");

describe("routes éditoriales publiques", () => {
  it("relie les cinq rubriques depuis une entrée principale active par famille", async () => {
    const header = await readFile(
      new URL("../src/components/Header.astro", import.meta.url),
      "utf8",
    );
    const layout = await readFile(
      new URL(
        "../src/components/editorial/EditorialLayout.astro",
        import.meta.url,
      ),
      "utf8",
    );
    expect(
      primaryNavigation.find((item) => item.label === "Découvrir")?.href,
    ).toBe("/actualites");
    expect(discoverNavigation.map((item) => item.href)).toEqual([
      "/actualites",
      "/activites",
      "/top-3",
      "/galerie",
      "/association",
    ]);
    expect(header).toContain("isDiscoverPath");
    expect(header).toContain("href === '/actualites'");
    expect(layout).toContain("discoverNavigation.map");
    expect(layout).toContain("activePath.startsWith(item.href)");
    expect(layout).toContain("aria-current");
  });

  it.each([
    "actualites/index.astro",
    "actualites/[slug].astro",
    "activites/index.astro",
    "activites/[slug].astro",
    "activites/archives.astro",
    "top-3.astro",
    "galerie.astro",
    "association/index.astro",
    "association/mission.astro",
    "association/equipe.astro",
    "association/comite.astro",
    "association/documents.astro",
  ])("expose %s", async (path) => {
    await expect(access(new URL(path, root))).resolves.toBeUndefined();
  });

  it("fournit une URL stable à chaque actualité et activité", () => {
    expect(news.every((item) => item.slug && item.question)).toBe(true);
    expect(
      [...activities, ...archivedActivities].every(
        (item) => item.slug && item.question,
      ),
    ).toBe(true);
    expect(
      new Set(
        [...news, ...activities, ...archivedActivities].map(
          (item) => item.slug,
        ),
      ).size,
    ).toBe(news.length + activities.length + archivedActivities.length);
  });

  it("sépare les archives des activités à venir", () => {
    expect(activities.every((item) => item.status === "demo")).toBe(true);
    expect(archivedActivities.every((item) => item.status === "archive")).toBe(
      true,
    );
  });

  it("limite la sélection à trois jeux et marque le contenu provisoire", () => {
    expect(topGames).toHaveLength(3);
    expect(
      topGames.every((game) =>
        /confirmer|venir|sélectionner/.test(`${game.name} ${game.age}`),
      ),
    ).toBe(true);
  });

  it("rend visibles les états sans contenu", async () => {
    const committeePage = await read("association/comite.astro");
    const newsPage = await read("actualites/index.astro");
    expect(committee).toHaveLength(0);
    expect(committeePage).toContain("Aucun profil publié");
    expect(newsPage).toContain("Aucune actualité publiée");
  });

  it("commence les pages par une question visiteur", async () => {
    const pages = await Promise.all([
      read("top-3.astro"),
      read("galerie.astro"),
      read("association/index.astro"),
      read("activites/index.astro"),
    ]);
    expect(
      pages.every((page) => page.includes('question="') && page.includes('?"')),
    ).toBe(true);
  });
});
