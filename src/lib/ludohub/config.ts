export const DEFAULT_LUDOHUB_TENANT = "paquis-secheron";
export const DEFAULT_LUDOHUB_TIMEOUT_MS = 4_000;

export type LudoHubConfig = {
  apiBase: URL | null;
  tenantSlug: string;
  timeoutMs: number;
  issue: "not_configured" | "invalid_config" | null;
};

export type LudoHubEnvironment = {
  LUDOHUB_PUBLIC_API_BASE?: string;
  LUDOHUB_PUBLIC_LUDO_SLUG?: string;
};

function normalizeApiBase(
  raw: string | undefined,
): Pick<LudoHubConfig, "apiBase" | "issue"> {
  if (!raw?.trim()) return { apiBase: null, issue: "not_configured" };
  try {
    const url = new URL(raw.trim());
    if (
      (url.protocol !== "https:" && url.protocol !== "http:") ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      return { apiBase: null, issue: "invalid_config" };
    }
    const path = url.pathname.replace(/\/+$/, "");
    url.pathname = path.endsWith("/api/public/v1")
      ? path
      : `${path === "" ? "" : path}/api/public/v1`;
    return { apiBase: url, issue: null };
  } catch {
    return { apiBase: null, issue: "invalid_config" };
  }
}

export function readLudoHubConfig(
  environment: LudoHubEnvironment = import.meta
    .env as unknown as LudoHubEnvironment,
  timeoutMs = DEFAULT_LUDOHUB_TIMEOUT_MS,
): LudoHubConfig {
  const base = normalizeApiBase(environment.LUDOHUB_PUBLIC_API_BASE);
  return {
    ...base,
    tenantSlug:
      environment.LUDOHUB_PUBLIC_LUDO_SLUG?.trim() || DEFAULT_LUDOHUB_TENANT,
    timeoutMs:
      Number.isSafeInteger(timeoutMs) && timeoutMs > 0
        ? timeoutMs
        : DEFAULT_LUDOHUB_TIMEOUT_MS,
  };
}

export function publicContactEndpoint(
  config = readLudoHubConfig(),
): string | null {
  if (!config.apiBase) return null;
  const url = new URL(config.apiBase);
  url.pathname = `${url.pathname.replace(/\/api\/public\/v1$/, "/api/public/contact/v1")}/${encodeURIComponent(config.tenantSlug)}`;
  return url.toString();
}
