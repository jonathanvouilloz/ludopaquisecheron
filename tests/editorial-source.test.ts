import { describe, expect, it, vi } from "vitest";
import { loadNews, loadNewsRoutes, loadTopThrees } from "../src/data/editorial";
import { createLudoHubClient } from "../src/lib/ludohub";

const ludo = { slug: "paquis-secheron", name: "Pâquis-Sécheron" };
const publishedAt = "2026-08-05T12:00:00.000Z";
const summary = {
  id: "news-live",
  slug: "slug-publie-depuis-ludohub",
  title: "Actualité publiée",
  summary: "Résumé réellement publié.",
  image: null,
  publishedAt,
};
const response = (data: unknown) =>
  new Response(JSON.stringify({ version: 1, data }), {
    headers: { "content-type": "application/json" },
  });

describe("sélection de la source éditoriale", () => {
  it("remplace entièrement la démo quand la liste live est disponible", async () => {
    const client = createLudoHubClient({
      baseUrl: "https://ludohub.example",
      fetch: vi
        .fn()
        .mockResolvedValue(response({ ludo, site: null, news: [summary] })),
    });

    const content = await loadNews(client);
    expect(content.mode).toBe("live");
    expect(content.noindex).toBe(false);
    expect(content.notice).toBeNull();
    expect(content.items.map((item) => item.slug)).toEqual([
      "slug-publie-depuis-ludohub",
    ]);
    expect(
      content.items.some((item) => item.slug === "bienvenue-sur-le-futur-site"),
    ).toBe(false);
  });

  it("conserve un vrai état vide quand la liste live est vide", async () => {
    const client = createLudoHubClient({
      baseUrl: "https://ludohub.example",
      fetch: vi
        .fn()
        .mockResolvedValue(response({ ludo, site: null, news: [] })),
    });

    const content = await loadNews(client);
    expect(content).toMatchObject({
      mode: "live",
      items: [],
      notice: null,
      noindex: false,
    });
  });

  it("utilise exclusivement la démo avec une notice si LudoHub est indisponible", async () => {
    const client = createLudoHubClient({
      baseUrl: "https://ludohub.example",
      fetch: vi.fn().mockRejectedValue(new Error("réseau indisponible")),
    });

    const content = await loadNews(client);
    expect(content.mode).toBe("demo");
    expect(content.noindex).toBe(true);
    expect(content.notice).toContain("Mode démonstration");
    expect(content.items.map((item) => item.slug)).toContain(
      "bienvenue-sur-le-futur-site",
    );
    expect(content.items.some((item) => item.slug === summary.slug)).toBe(
      false,
    );
  });

  it("génère les détails avec les slugs live et projette le Markdown en paragraphes texte", async () => {
    const fetcher = vi.fn().mockImplementation((url: URL) => {
      if (url.pathname.endsWith(`/news/${summary.slug}`)) {
        return Promise.resolve(
          response({
            ludo,
            site: null,
            news: {
              ...summary,
              bodyMarkdown:
                "# Titre\n\nPremier paragraphe.\n\n<script>privé</script>",
              sites: [],
            },
          }),
        );
      }
      return Promise.resolve(response({ ludo, site: null, news: [summary] }));
    });
    const client = createLudoHubClient({
      baseUrl: "https://ludohub.example",
      fetch: fetcher,
    });

    const content = await loadNewsRoutes(client);
    expect(content.items).toHaveLength(1);
    expect(content.items[0]).toMatchObject({
      slug: summary.slug,
      detailAvailable: true,
      body: ["Titre", "Premier paragraphe.", "<script>privé</script>"],
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});

describe("sélection Top 3 de l’accueil", () => {
  const topSummary = {
    id: "top-live",
    slug: "top-live",
    theme: "Coopération",
    isHomepage: true,
    games: [{ name: "A" }, { name: "B" }, { name: "C" }],
    publishedAt,
  };

  it("préserve isHomepage depuis la liste live jusque dans TopThreeView", async () => {
    const fetcher = vi.fn().mockImplementation((url: URL) => {
      if (url.pathname.endsWith("/top-threes/top-live")) {
        return Promise.resolve(response({
          ludo,
          site: null,
          topThree: {
            ...topSummary,
            games: topSummary.games.map((game) => ({ ...game, description: null })),
            sites: [],
          },
        }));
      }
      return Promise.resolve(response({ ludo, site: null, topThrees: [topSummary] }));
    });
    const content = await loadTopThrees(createLudoHubClient({ baseUrl: "https://ludohub.example", fetch: fetcher }));
    expect(content).toMatchObject({ mode: "live", items: [{ slug: "top-live", isHomepage: true }] });
  });

  it("marque la sélection démo comme affichée sur l’accueil", async () => {
    const client = createLudoHubClient({
      baseUrl: "https://ludohub.example",
      fetch: vi.fn().mockRejectedValue(new Error("indisponible")),
    });
    const content = await loadTopThrees(client);
    expect(content).toMatchObject({ mode: "demo", items: [{ isHomepage: true }] });
  });
});
