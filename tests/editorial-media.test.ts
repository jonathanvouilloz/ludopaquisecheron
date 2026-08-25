import { describe, expect, it, vi } from "vitest";
import {
  loadActivities,
  loadNews,
  loadNewsDetail,
} from "../src/data/editorial";
import { createLudoHubClient } from "../src/lib/ludohub";

const ludo = { slug: "paquis-secheron", name: "Pâquis-Sécheron" };
const publishedAt = "2026-08-20T12:00:00.000Z";
const image = {
  url: "https://blob.example/flyer.webp",
  alt: "Flyer de la fête des jeux",
};
const response = (data: unknown) =>
  new Response(JSON.stringify({ version: 1, data }), {
    headers: { "content-type": "application/json" },
  });

describe("médias éditoriaux publics", () => {
  it("préserve l’image LudoHub d’une actualité pour le rendu public", async () => {
    const fetcher = vi.fn().mockImplementation((url: URL) => {
      if (url.pathname.endsWith("/news")) {
        return Promise.resolve(
          response({
            ludo,
            site: null,
            news: [
              {
                id: "news-1",
                slug: "fete-des-jeux",
                title: "Fête des jeux",
                summary: "Venez jouer.",
                image,
                publishedAt,
              },
            ],
          }),
        );
      }
      throw new Error(`URL inattendue: ${url.pathname}`);
    });
    const client = createLudoHubClient({
      baseUrl: "https://ludohub.example",
      fetch: fetcher,
    });

    const content = await loadNews(client);

    expect(content.mode).toBe("live");
    expect(content.items[0].image).toEqual(image);
  });

  it("préserve l’image LudoHub d’une activité pour le rendu public", async () => {
    const fetcher = vi.fn().mockImplementation((url: URL) => {
      if (url.pathname.endsWith("/activities")) {
        return Promise.resolve(
          response({
            ludo,
            site: null,
            timeZone: "Europe/Zurich",
            activities: [
              {
                id: "activity-1",
                slug: "fete-des-jeux",
                title: "Fête des jeux",
                summary: "Venez jouer.",
                location: null,
                image,
                lifecycle: "active",
                featuredRank: 1,
                publishedAt,
                schedule: {
                  type: "permanent",
                  recurrenceRule: null,
                  dates: [],
                },
              },
            ],
          }),
        );
      }
      throw new Error(`URL inattendue: ${url.pathname}`);
    });
    const client = createLudoHubClient({
      baseUrl: "https://ludohub.example",
      fetch: fetcher,
    });

    const content = await loadActivities(false, client);

    expect(content.mode).toBe("live");
    expect(content.items[0].image).toEqual(image);
  });

  it("projette l’image d’appoint et les PDF du détail", async () => {
    const supportImage = {
      url: "https://blob.example/interieur.webp",
      alt: "Familles autour d’une table",
      caption: "Une après-midi jeux",
      credit: "Ludo",
    };
    const attachment = {
      id: "pdf-1",
      title: "Programme complet",
      fileName: "programme.pdf",
      viewUrl: "https://blob.example/programme.pdf",
      downloadUrl: "https://blob.example/programme.pdf?download=1",
      sizeBytes: 2048,
    };
    const fetcher = vi.fn().mockResolvedValue(
      response({
        ludo,
        site: null,
        news: {
          id: "news-1",
          slug: "fete-des-jeux",
          title: "Fête des jeux",
          summary: "Venez jouer.",
          image,
          publishedAt,
          bodyMarkdown: "Un premier paragraphe.",
          sites: [],
          supportImage,
          attachments: [attachment],
        },
      }),
    );
    const client = createLudoHubClient({
      baseUrl: "https://ludohub.example",
      fetch: fetcher,
    });

    const content = await loadNewsDetail("fete-des-jeux", client);

    expect(content?.item.supportImage).toEqual(supportImage);
    expect(content?.item.attachments).toEqual([attachment]);
  });
});
