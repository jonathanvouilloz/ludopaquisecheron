import {
  readLudoHubConfig,
  type LudoHubConfig,
  type LudoHubEnvironment,
} from "./config.js";
import type {
  ActivitiesPayload,
  ActivityDetailPayload,
  AnnouncementsPayload,
  DirectoryPayload,
  DocumentDetailPayload,
  DocumentsPayload,
  FaqsPayload,
  GalleryPayload,
  Ludo,
  LudoHubFailureReason,
  LudoHubResult,
  NewsDetailPayload,
  NewsPayload,
  ProfilesPayload,
  SitesPayload,
  TopThreeDetailPayload,
  TopThreesPayload,
} from "./types.js";
import {
  activitiesPayload,
  activityDetailPayload,
  announcementsPayload,
  directoryPayload,
  documentDetailPayload,
  documentsPayload,
  faqsPayload,
  galleryPayload,
  newsDetailPayload,
  newsPayload,
  profilesPayload,
  sitesPayload,
  topThreeDetailPayload,
  topThreesPayload,
  type Parser,
} from "./validators.js";

export type ReadOptions<T> = { fallback?: T; timeoutMs?: number };
export type ListOptions<T> = ReadOptions<T> & { site?: string; limit?: number };
export type ProfilesOptions = ListOptions<ProfilesPayload> & {
  section?: "team" | "committee";
};
export type LudoHubClientOptions = {
  baseUrl?: string;
  tenantSlug?: string;
  timeoutMs?: number;
  fetch?: typeof globalThis.fetch;
  environment?: LudoHubEnvironment;
};

type PublicPayload = { ludo: Ludo };
type QueryValue = string | number | undefined;

function failure<T>(
  reason: LudoHubFailureReason,
  fallback: T | undefined,
  status?: number,
): LudoHubResult<T> {
  if (fallback !== undefined)
    return { source: "fallback", data: fallback, reason, status };
  if (reason === "not_configured")
    return { source: "empty", data: null, reason };
  if (reason === "not_found")
    return { source: "empty", data: null, reason, status: 404 };
  return { source: "unavailable", data: null, reason, status };
}

function buildConfig(options: LudoHubClientOptions): LudoHubConfig {
  const environment = {
    ...(options.environment ?? import.meta.env),
    ...(options.baseUrl === undefined
      ? {}
      : { LUDOHUB_PUBLIC_API_BASE: options.baseUrl }),
    ...(options.tenantSlug === undefined
      ? {}
      : { LUDOHUB_PUBLIC_LUDO_SLUG: options.tenantSlug }),
  };
  return readLudoHubConfig(environment, options.timeoutMs);
}

export class LudoHubClient {
  readonly config: LudoHubConfig;
  readonly fetcher: typeof globalThis.fetch;

  constructor(options: LudoHubClientOptions = {}) {
    this.config = buildConfig(options);
    this.fetcher = options.fetch ?? globalThis.fetch;
  }

  private async get<T extends PublicPayload>(
    segments: string[],
    parser: Parser<T>,
    options: ReadOptions<T> & { query?: Record<string, QueryValue> } = {},
  ): Promise<LudoHubResult<T>> {
    const fallback = options.fallback;
    if (!this.config.apiBase)
      return failure(this.config.issue ?? "invalid_config", fallback);

    const suffix = [this.config.tenantSlug, ...segments]
      .map(encodeURIComponent)
      .join("/");
    const url = new URL(
      `${this.config.apiBase.toString().replace(/\/$/, "")}/${suffix}`,
    );
    for (const [key, value] of Object.entries(options.query ?? {})) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }

    const timeoutMs =
      Number.isSafeInteger(options.timeoutMs) && (options.timeoutMs ?? 0) > 0
        ? options.timeoutMs!
        : this.config.timeoutMs;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await this.fetcher(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      if (response.status === 404) return failure("not_found", fallback, 404);
      if (!response.ok) return failure("http_error", fallback, response.status);

      let envelope: unknown;
      try {
        envelope = await response.json();
      } catch {
        return failure("invalid_response", fallback);
      }
      if (
        typeof envelope !== "object" ||
        envelope === null ||
        Array.isArray(envelope) ||
        !("version" in envelope) ||
        envelope.version !== 1 ||
        !("data" in envelope)
      ) {
        return failure("invalid_response", fallback);
      }
      const data = parser(envelope.data);
      if (!data) return failure("invalid_response", fallback);
      if (data.ludo.slug !== this.config.tenantSlug) {
        return failure("invalid_response", fallback);
      }
      return { source: "live", data };
    } catch {
      return failure(
        controller.signal.aborted ? "timeout" : "network",
        fallback,
      );
    } finally {
      clearTimeout(timer);
    }
  }

  private list<T extends PublicPayload>(
    segments: string[],
    parser: Parser<T>,
    options: ListOptions<T>,
    maxLimit: number,
    query: Record<string, QueryValue>,
  ): Promise<LudoHubResult<T>> {
    if (
      options.limit !== undefined &&
      (!Number.isSafeInteger(options.limit) ||
        options.limit < 1 ||
        options.limit > maxLimit)
    ) {
      return Promise.resolve(failure("invalid_request", options.fallback));
    }
    return this.get(segments, parser, { ...options, query });
  }

  sites(options: ReadOptions<SitesPayload> = {}) {
    return this.get(["sites"], sitesPayload, options);
  }
  announcements(options: ListOptions<AnnouncementsPayload> = {}) {
    return this.get(["announcements"], announcementsPayload, {
      ...options,
      query: { site: options.site },
    });
  }
  news(options: ListOptions<NewsPayload> = {}) {
    return this.list(["news"], newsPayload, options, 50, {
      site: options.site,
      limit: options.limit,
    });
  }
  newsDetail(
    slug: string,
    options: Omit<ListOptions<NewsDetailPayload>, "limit"> = {},
  ) {
    return this.get(["news", slug], newsDetailPayload, {
      ...options,
      query: { site: options.site },
    });
  }
  activities(options: ListOptions<ActivitiesPayload> = {}) {
    return this.list(["activities"], activitiesPayload, options, 50, {
      site: options.site,
      limit: options.limit,
    });
  }
  archivedActivities(options: ListOptions<ActivitiesPayload> = {}) {
    return this.list(
      ["activities", "archive"],
      activitiesPayload,
      options,
      50,
      {
        site: options.site,
        limit: options.limit,
      },
    );
  }
  activityDetail(
    slug: string,
    options: Omit<ListOptions<ActivityDetailPayload>, "limit"> = {},
  ) {
    return this.get(["activities", slug], activityDetailPayload, {
      ...options,
      query: { site: options.site },
    });
  }
  topThrees(options: ListOptions<TopThreesPayload> = {}) {
    return this.list(["top-threes"], topThreesPayload, options, 50, {
      site: options.site,
      limit: options.limit,
    });
  }
  topThreeDetail(
    slug: string,
    options: Omit<ListOptions<TopThreeDetailPayload>, "limit"> = {},
  ) {
    return this.get(["top-threes", slug], topThreeDetailPayload, {
      ...options,
      query: { site: options.site },
    });
  }
  faqs(options: ListOptions<FaqsPayload> = {}) {
    return this.list(["faqs"], faqsPayload, options, 200, {
      site: options.site,
      limit: options.limit,
    });
  }
  documents(options: ListOptions<DocumentsPayload> = {}) {
    return this.list(["documents"], documentsPayload, options, 50, {
      site: options.site,
      limit: options.limit,
    });
  }
  documentDetail(
    slug: string,
    options: Omit<ListOptions<DocumentDetailPayload>, "limit"> = {},
  ) {
    return this.get(["documents", slug], documentDetailPayload, {
      ...options,
      query: { site: options.site },
    });
  }
  gallery(options: ListOptions<GalleryPayload> = {}) {
    return this.list(["gallery"], galleryPayload, options, 100, {
      site: options.site,
      limit: options.limit,
    });
  }
  profiles(options: ProfilesOptions = {}) {
    return this.list(["profiles"], profilesPayload, options, 200, {
      section: options.section,
      site: options.site,
      limit: options.limit,
    });
  }
  directory(options: Omit<ListOptions<DirectoryPayload>, "site"> = {}) {
    return this.list(["directory"], directoryPayload, options, 200, {
      limit: options.limit,
    });
  }
}

export const createLudoHubClient = (options: LudoHubClientOptions = {}) =>
  new LudoHubClient(options);

/** Client par défaut destiné aux frontmatters Astro et à `getStaticPaths`. */
export const ludohub = createLudoHubClient();
