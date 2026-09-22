import { afterEach, describe, expect, it, vi } from "vitest";
import { createLudoHubClient } from "./client.js";
import {
  publicActivityRegistrationEndpoint,
  publicContactEndpoint,
  publicMembershipFormUrl,
  readLudoHubConfig,
} from "./config.js";
import type { SitesPayload } from "./types.js";

const sites: SitesPayload = {
  ludo: { slug: "paquis-secheron", name: "Pâquis-Sécheron" },
  sites: [
    {
      id: "site-a",
      slug: "paquis",
      name: "Pâquis",
      address: "1 rue du Jeu",
      postalCode: "1201",
      city: "Genève",
      phone: null,
      email: null,
      accessInfo: null,
      directionsUrl: null,
      latitude: null,
      longitude: null,
      isPrimary: true,
      sortOrder: 0,
      openingIntervals: [{ dayOfWeek: 2, opensAt: "14:00", closesAt: "18:30" }],
    },
  ],
};
const envelope = (data: unknown, version = 1) =>
  new Response(JSON.stringify({ version, data }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("client public LudoHub", () => {
  it("conserve isHomepage et retire les champs privés des Top 3", async () => {
    const payload = {
      ludo: sites.ludo,
      site: null,
      topThrees: [{
        id: "top-home",
        slug: "top-home",
        theme: "Accueil",
        isHomepage: true,
        games: [{ name: "A" }, { name: "B" }, { name: "C" }],
        publishedAt: "2026-08-05T12:00:00.000Z",
        internalNote: "secret",
      }],
    };
    const client = createLudoHubClient({
      baseUrl: "https://ludohub.example",
      fetch: vi.fn().mockResolvedValue(envelope(payload)),
    });
    const result = await client.topThrees();
    expect(result).toMatchObject({
      source: "live",
      data: { topThrees: [{ slug: "top-home", isHomepage: true }] },
    });
    expect(JSON.stringify(result)).not.toContain("internalNote");
    expect(JSON.stringify(result)).not.toContain("secret");
  });

  it("valide une enveloppe V1 et retourne la source live", async () => {
    const fetcher = vi.fn().mockResolvedValue(envelope(sites));
    const client = createLudoHubClient({
      baseUrl: "https://ludohub.example",
      fetch: fetcher,
    });

    await expect(client.sites()).resolves.toEqual({
      source: "live",
      data: sites,
    });
    expect(fetcher).toHaveBeenCalledOnce();
    expect(String(fetcher.mock.calls[0][0])).toBe(
      "https://ludohub.example/api/public/v1/paquis-secheron/sites",
    );
  });

  it("retourne empty sur 404 et fallback si le consommateur en fournit un", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 404 }));
    const client = createLudoHubClient({
      baseUrl: "https://ludohub.example/api/public/v1",
      fetch: fetcher,
    });

    await expect(client.sites()).resolves.toEqual({
      source: "empty",
      data: null,
      reason: "not_found",
      status: 404,
    });
    await expect(client.sites({ fallback: sites })).resolves.toEqual({
      source: "fallback",
      data: sites,
      reason: "not_found",
      status: 404,
    });
  });

  it("distingue 5xx et timeout sans exposer URL ni corps distant", async () => {
    const serverError = vi
      .fn()
      .mockResolvedValue(
        new Response("SECRET diagnostic interne", { status: 503 }),
      );
    const unavailable = await createLudoHubClient({
      baseUrl: "https://private-user:password@ludohub.example",
      fetch: serverError,
    }).sites();
    expect(unavailable).toEqual({
      source: "unavailable",
      data: null,
      reason: "invalid_config",
    });
    expect(serverError).not.toHaveBeenCalled();
    expect(JSON.stringify(unavailable)).not.toContain("password");

    const validServerError = vi
      .fn()
      .mockResolvedValue(
        new Response("SECRET diagnostic interne", { status: 503 }),
      );
    const httpFailure = await createLudoHubClient({
      baseUrl: "https://ludohub.example",
      fetch: validServerError,
    }).sites();
    expect(httpFailure).toEqual({
      source: "unavailable",
      data: null,
      reason: "http_error",
      status: 503,
    });
    expect(JSON.stringify(httpFailure)).not.toContain("SECRET");

    vi.useFakeTimers();
    const hangingFetch = vi.fn(
      (_url: URL | RequestInfo, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(new DOMException("aborted", "AbortError")),
          );
        }),
    );
    const pending = createLudoHubClient({
      baseUrl: "https://ludohub.example",
      timeoutMs: 25,
      fetch: hangingFetch,
    }).sites();
    await vi.advanceTimersByTimeAsync(25);
    await expect(pending).resolves.toEqual({
      source: "unavailable",
      data: null,
      reason: "timeout",
    });
  });

  it("ne fait aucune requête sans base et accepte un fallback de build", async () => {
    const fetcher = vi.fn();
    const client = createLudoHubClient({ baseUrl: "", fetch: fetcher });
    await expect(client.sites()).resolves.toEqual({
      source: "empty",
      data: null,
      reason: "not_configured",
    });
    await expect(client.sites({ fallback: sites })).resolves.toEqual({
      source: "fallback",
      data: sites,
      reason: "not_configured",
    });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("encode le tenant, les slugs et les filtres dans tous les helpers de routes", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 404 }));
    const client = createLudoHubClient({
      baseUrl: "https://ludohub.example/api/public/v1/",
      tenantSlug: "tenant/test é",
      fetch: fetcher,
    });
    await client.newsDetail("été/2026", { site: "Pâquis nord" });
    expect(String(fetcher.mock.calls[0][0])).toBe(
      "https://ludohub.example/api/public/v1/tenant%2Ftest%20%C3%A9/news/%C3%A9t%C3%A9%2F2026?site=P%C3%A2quis+nord",
    );
  });

  it("expose tous les endpoints de lecture attendus", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 404 }));
    const client = createLudoHubClient({
      baseUrl: "https://ludohub.example",
      fetch: fetcher,
    });
    await client.sites();
    await client.announcements();
    await client.news();
    await client.newsDetail("article");
    await client.activities();
    await client.archivedActivities();
    await client.activityDetail("atelier");
    await client.topThrees();
    await client.topThreeDetail("cooperatifs");
    await client.faqs();
    await client.documents();
    await client.documentDetail("statuts");
    await client.gallery();
    await client.profiles();
    await client.directory();

    expect(
      fetcher.mock.calls.map(([url]) => new URL(String(url)).pathname),
    ).toEqual([
      "/api/public/v1/paquis-secheron/sites",
      "/api/public/v1/paquis-secheron/announcements",
      "/api/public/v1/paquis-secheron/news",
      "/api/public/v1/paquis-secheron/news/article",
      "/api/public/v1/paquis-secheron/activities",
      "/api/public/v1/paquis-secheron/activities/archive",
      "/api/public/v1/paquis-secheron/activities/atelier",
      "/api/public/v1/paquis-secheron/top-threes",
      "/api/public/v1/paquis-secheron/top-threes/cooperatifs",
      "/api/public/v1/paquis-secheron/faqs",
      "/api/public/v1/paquis-secheron/documents",
      "/api/public/v1/paquis-secheron/documents/statuts",
      "/api/public/v1/paquis-secheron/gallery",
      "/api/public/v1/paquis-secheron/profiles",
      "/api/public/v1/paquis-secheron/directory",
    ]);
  });

  it("rejette une version, une forme ou un tenant inattendus", async () => {
    const wrongTenant = {
      ...sites,
      ludo: { slug: "autre-tenant", name: "Autre" },
    };
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(envelope(sites, 2))
      .mockResolvedValueOnce(envelope({ ludo: sites.ludo, sites: [{ id: 1 }] }))
      .mockResolvedValueOnce(envelope(wrongTenant));
    const client = createLudoHubClient({
      baseUrl: "https://ludohub.example",
      fetch: fetcher,
    });
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await expect(client.sites()).resolves.toEqual({
        source: "unavailable",
        data: null,
        reason: "invalid_response",
      });
    }
  });

  it("retourne uniquement la projection contractuelle des données distantes", async () => {
    const remote = {
      ...sites,
      internal: "root-secret",
      ludo: { ...sites.ludo, passwordHash: "hash-secret" },
      sites: sites.sites.map((site) => ({
        ...site,
        privateNote: "site-secret",
        openingIntervals: site.openingIntervals.map((interval) => ({
          ...interval,
          staffOnly: "interval-secret",
        })),
      })),
    };
    const client = createLudoHubClient({
      baseUrl: "https://ludohub.example",
      fetch: vi.fn().mockResolvedValue(envelope(remote)),
    });

    const result = await client.sites();
    expect(result).toEqual({ source: "live", data: sites });
    expect(result.source === "live" && result.data).not.toBe(remote);
    expect(JSON.stringify(result)).not.toContain("secret");
  });

  it("refuse les limites invalides avant tout fetch, avec fallback cohérent", async () => {
    const fetcher = vi.fn();
    const client = createLudoHubClient({
      baseUrl: "https://ludohub.example",
      fetch: fetcher,
    });
    const newsFallback = { ludo: sites.ludo, site: null, news: [] };

    await expect(client.news({ limit: 0 })).resolves.toEqual({
      source: "unavailable",
      data: null,
      reason: "invalid_request",
    });
    await expect(
      client.news({ limit: 51, fallback: newsFallback }),
    ).resolves.toEqual({
      source: "fallback",
      data: newsFallback,
      reason: "invalid_request",
    });
    await client.activities({ limit: 1.5 });
    await client.archivedActivities({ limit: -1 });
    await client.topThrees({ limit: 51 });
    await client.documents({ limit: Number.NaN });
    await client.gallery({ limit: 101 });
    await client.faqs({ limit: 201 });
    await client.profiles({ limit: 201 });
    await client.directory({ limit: 201 });

    expect(fetcher).not.toHaveBeenCalled();
  });

  it("accepte les maxima des listes et n’envoie jamais limit sur les détails", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 404 }));
    const client = createLudoHubClient({
      baseUrl: "https://ludohub.example",
      fetch: fetcher,
    });

    await client.news({ limit: 50 });
    await client.activities({ limit: 50 });
    await client.topThrees({ limit: 50 });
    await client.documents({ limit: 50 });
    await client.gallery({ limit: 100 });
    await client.faqs({ limit: 200 });
    await client.profiles({ limit: 200 });
    await client.directory({ limit: 200 });

    const accidentalLimit = { site: "paquis", limit: 12 };
    await client.newsDetail("news", accidentalLimit);
    await client.activityDetail("activity", accidentalLimit);
    await client.topThreeDetail("top", accidentalLimit);
    await client.documentDetail("document", accidentalLimit);

    const urls = fetcher.mock.calls.map(([url]) => new URL(String(url)));
    expect(
      urls.slice(0, 8).map((url) => url.searchParams.get("limit")),
    ).toEqual(["50", "50", "50", "50", "100", "200", "200", "200"]);
    expect(urls.slice(8).every((url) => !url.searchParams.has("limit"))).toBe(
      true,
    );
  });
});

describe("configuration contact public", () => {
  it("dérive l’endpoint séparé et applique le tenant par défaut", () => {
    const config = readLudoHubConfig({
      LUDOHUB_PUBLIC_API_BASE: "https://ludohub.example",
    });
    expect(config.tenantSlug).toBe("paquis-secheron");
    expect(publicContactEndpoint(config)).toBe(
      "https://ludohub.example/api/public/contact/v1/paquis-secheron",
    );
  });

  it("dérive et encode l'endpoint d'inscription séparé", () => {
    const config = readLudoHubConfig({
      LUDOHUB_PUBLIC_API_BASE: "https://ludohub.example",
      LUDOHUB_PUBLIC_LUDO_SLUG: "tenant test",
    });
    expect(publicActivityRegistrationEndpoint("été/2026", config)).toBe(
      "https://ludohub.example/api/public/registrations/v1/tenant%20test/activities/%C3%A9t%C3%A9%2F2026",
    );
  });

  it("dérive le formulaire d'adhésion depuis la racine LudoHub et encode le tenant", () => {
    const rootConfig = readLudoHubConfig({
      LUDOHUB_PUBLIC_API_BASE: "https://ludohub.example",
      LUDOHUB_PUBLIC_LUDO_SLUG: "famille/été",
    });
    expect(publicMembershipFormUrl(rootConfig)).toBe(
      "https://ludohub.example/formulaires/famille%2F%C3%A9t%C3%A9/adhesion",
    );

    const nestedConfig = readLudoHubConfig({
      LUDOHUB_PUBLIC_API_BASE: "https://example.test/ludohub/api/public/v1/",
    });
    expect(publicMembershipFormUrl(nestedConfig)).toBe(
      "https://example.test/ludohub/formulaires/paquis-secheron/adhesion",
    );
  });

  it("n'invente aucune URL si la configuration est absente ou invalide", () => {
    expect(publicMembershipFormUrl(readLudoHubConfig({}))).toBeNull();
    expect(publicMembershipFormUrl(readLudoHubConfig({
      LUDOHUB_PUBLIC_API_BASE: "javascript:alert(1)",
    }))).toBeNull();
    expect(publicMembershipFormUrl(readLudoHubConfig({
      LUDOHUB_PUBLIC_API_BASE: "https://user:secret@ludohub.example",
    }))).toBeNull();
  });
});
