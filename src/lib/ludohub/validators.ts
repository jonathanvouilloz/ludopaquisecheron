import type {
  ActivitiesPayload,
  ActivityDetailPayload,
  ActivitySchedule,
  ActivitySchedulePreview,
  AnnouncementsPayload,
  DirectoryPayload,
  DocumentDetailPayload,
  DocumentsPayload,
  FaqsPayload,
  GalleryPayload,
  NewsDetailPayload,
  NewsPayload,
  ProfilesPayload,
  PublicImage,
  PublicSiteRef,
  SitesPayload,
  TopThreeDetailPayload,
  TopThreesPayload,
} from "./types.js";

type RecordValue = Record<string, unknown>;
export type Parser<T> = (value: unknown) => T | null;

const record = (value: unknown): RecordValue | null =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as RecordValue)
    : null;
const text = (value: unknown): string | null =>
  typeof value === "string" ? value : null;
const nonEmpty = (value: unknown): string | null => {
  const parsed = text(value);
  return parsed !== null && parsed.trim() ? parsed : null;
};
const integer = (value: unknown): number | null =>
  Number.isSafeInteger(value) ? (value as number) : null;
const finite = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;
const nullableText = (value: unknown): value is string | null =>
  value === null || typeof value === "string";
const nullableEmail = (value: unknown): value is string | null =>
  value === null ||
  (typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
const nullableFinite = (value: unknown): value is number | null =>
  value === null || (typeof value === "number" && Number.isFinite(value));
const nullableInteger = (value: unknown): value is number | null =>
  value === null || Number.isSafeInteger(value);
const oneOf = <T extends string>(
  value: unknown,
  values: readonly T[],
): T | null =>
  typeof value === "string" && values.includes(value as T)
    ? (value as T)
    : null;
const parseArray = <T>(
  value: unknown,
  parser: Parser<T>,
  max: number,
): T[] | null => {
  if (!Array.isArray(value) || value.length > max) return null;
  const result: T[] = [];
  for (const item of value) {
    const parsed = parser(item);
    if (parsed === null) return null;
    result.push(parsed);
  }
  return result;
};

const ISO_TIMESTAMP =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;
const TIME = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

const timestamp = (value: unknown): string | null => {
  const parsed = text(value);
  return parsed &&
    ISO_TIMESTAMP.test(parsed) &&
    !Number.isNaN(Date.parse(parsed))
    ? parsed
    : null;
};
const httpUrl = (value: unknown): string | null => {
  const parsed = nonEmpty(value);
  if (!parsed) return null;
  try {
    const url = new URL(parsed);
    return url.protocol === "https:" || url.protocol === "http:"
      ? parsed
      : null;
  } catch {
    return null;
  }
};

const parseLudo = (value: unknown) => {
  const source = record(value);
  const slug = nonEmpty(source?.slug);
  const name = nonEmpty(source?.name);
  return source && slug && name ? { slug, name } : null;
};
const parseSiteRef: Parser<PublicSiteRef> = (value) => {
  const source = record(value);
  const id = nonEmpty(source?.id);
  const slug = nonEmpty(source?.slug);
  const name = nonEmpty(source?.name);
  return source && id && slug && name ? { id, slug, name } : null;
};
const parseImage: Parser<PublicImage> = (value) => {
  const source = record(value);
  const url = httpUrl(source?.url);
  const alt = nonEmpty(source?.alt);
  return source && url && alt ? { url, alt } : null;
};
const parseNullableImage = (value: unknown): PublicImage | null | undefined => {
  if (value === null) return null;
  return parseImage(value) ?? undefined;
};
const parseContext = (value: RecordValue) => {
  const ludo = parseLudo(value.ludo);
  if (!ludo || !nullableText(value.site)) return null;
  return { ludo, site: value.site };
};

const parseOpeningInterval = (value: unknown) => {
  const source = record(value);
  const dayOfWeek = integer(source?.dayOfWeek);
  const opensAt = text(source?.opensAt);
  const closesAt = text(source?.closesAt);
  if (
    !source ||
    dayOfWeek === null ||
    dayOfWeek < 1 ||
    dayOfWeek > 7 ||
    !opensAt ||
    !closesAt ||
    !TIME.test(opensAt) ||
    !TIME.test(closesAt) ||
    opensAt >= closesAt
  )
    return null;
  return { dayOfWeek, opensAt, closesAt };
};
const parseLudoSite = (value: unknown) => {
  const source = record(value);
  const ref = parseSiteRef(value);
  const latitude = source ? finite(source.latitude) : null;
  const longitude = source ? finite(source.longitude) : null;
  const sortOrder = source ? integer(source.sortOrder) : null;
  const openingIntervals = parseArray(
    source?.openingIntervals,
    parseOpeningInterval,
    50,
  );
  if (
    !source ||
    !ref ||
    !nullableText(source.address) ||
    !nullableText(source.postalCode) ||
    !nullableText(source.city) ||
    !nullableText(source.phone) ||
    !nullableEmail(source.email) ||
    !nullableText(source.accessInfo) ||
    !nullableFinite(source.latitude) ||
    !nullableFinite(source.longitude) ||
    typeof source.isPrimary !== "boolean" ||
    sortOrder === null ||
    !openingIntervals
  )
    return null;
  if ((latitude === null) !== (longitude === null)) return null;
  openingIntervals.sort(
    (a, b) => a.dayOfWeek - b.dayOfWeek || a.opensAt.localeCompare(b.opensAt),
  );
  for (let index = 1; index < openingIntervals.length; index += 1) {
    const previous = openingIntervals[index - 1];
    const current = openingIntervals[index];
    if (
      previous.dayOfWeek === current.dayOfWeek &&
      current.opensAt < previous.closesAt
    )
      return null;
  }
  return {
    ...ref,
    address: source.address,
    postalCode: source.postalCode,
    city: source.city,
    phone: source.phone,
    email: source.email,
    accessInfo: source.accessInfo,
    latitude: source.latitude,
    longitude: source.longitude,
    isPrimary: source.isPrimary,
    sortOrder,
    openingIntervals,
  };
};
export const sitesPayload: Parser<SitesPayload> = (value) => {
  const source = record(value);
  const ludo = parseLudo(source?.ludo);
  const sites = parseArray(source?.sites, parseLudoSite, 200);
  return source && ludo && sites ? { ludo, sites } : null;
};

const parseAnnouncement = (value: unknown) => {
  const source = record(value);
  const id = nonEmpty(source?.id);
  const title = nonEmpty(source?.title);
  const message = nonEmpty(source?.message);
  const publishedAt = timestamp(source?.publishedAt);
  const sites = parseArray(source?.sites, parseSiteRef, 200);
  return source && id && title && message && publishedAt && sites
    ? { id, title, message, publishedAt, sites }
    : null;
};
export const announcementsPayload: Parser<AnnouncementsPayload> = (value) => {
  const source = record(value);
  const context = source && parseContext(source);
  const announcements = parseArray(
    source?.announcements,
    parseAnnouncement,
    50,
  );
  return source && context && announcements
    ? { ...context, announcements }
    : null;
};

const parseNewsSummary = (value: unknown) => {
  const source = record(value);
  const id = nonEmpty(source?.id);
  const slug = nonEmpty(source?.slug);
  const title = nonEmpty(source?.title);
  const summary = text(source?.summary);
  const image = parseNullableImage(source?.image);
  const publishedAt = timestamp(source?.publishedAt);
  return source &&
    id &&
    slug &&
    title &&
    summary !== null &&
    image !== undefined &&
    publishedAt
    ? { id, slug, title, summary, image, publishedAt }
    : null;
};
const parseNewsItem = (value: unknown) => {
  const source = record(value);
  const base = parseNewsSummary(value);
  const bodyMarkdown = text(source?.bodyMarkdown);
  const sites = parseArray(source?.sites, parseSiteRef, 200);
  return source && base && bodyMarkdown !== null && sites
    ? { ...base, bodyMarkdown, sites }
    : null;
};
export const newsPayload: Parser<NewsPayload> = (value) => {
  const source = record(value);
  const context = source && parseContext(source);
  const news = parseArray(source?.news, parseNewsSummary, 50);
  return source && context && news ? { ...context, news } : null;
};
export const newsDetailPayload: Parser<NewsDetailPayload> = (value) => {
  const source = record(value);
  const context = source && parseContext(source);
  const news = parseNewsItem(source?.news);
  return source && context && news ? { ...context, news } : null;
};

const parseActivityDate = (value: unknown) => {
  const source = record(value);
  const startsAt = timestamp(source?.startsAt);
  const endsAt = source?.endsAt === null ? null : timestamp(source?.endsAt);
  if (!source || !startsAt || (endsAt === null && source.endsAt !== null))
    return null;
  if (endsAt && Date.parse(endsAt) <= Date.parse(startsAt)) return null;
  return { startsAt, endsAt };
};
const parseActivityException = (value: unknown) => {
  const source = record(value);
  const excludedAt = timestamp(source?.excludedAt);
  if (
    !source ||
    !excludedAt ||
    !nullableText(source.reason) ||
    (source.reason !== null &&
      (!source.reason.trim() || source.reason.length > 500))
  )
    return null;
  return { excludedAt, reason: source.reason };
};

const RRULE_KEYS = ["FREQ", "INTERVAL", "BYDAY", "COUNT", "UNTIL"] as const;
const RRULE_FREQUENCIES = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"] as const;
const RRULE_DAYS = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"] as const;

function parseUntil(value: string): Date | null {
  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(value);
  if (!match) return null;
  const [, year, month, day, hour, minute, second] = match.map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  return parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day &&
    parsed.getUTCHours() === hour &&
    parsed.getUTCMinutes() === minute &&
    parsed.getUTCSeconds() === second
    ? parsed
    : null;
}

function parseRecurrenceRule(
  value: unknown,
  firstOccurrence: string,
): string | null {
  const normalized =
    typeof value === "string" ? value.trim().toUpperCase() : "";
  if (!normalized || normalized.length > 1000 || /[\r\n]/.test(normalized)) {
    return null;
  }
  const values = new Map<string, string>();
  for (const segment of normalized.split(";")) {
    const [key, segmentValue, ...extra] = segment.split("=");
    if (
      !key ||
      !segmentValue ||
      extra.length ||
      !RRULE_KEYS.includes(key as (typeof RRULE_KEYS)[number]) ||
      values.has(key)
    )
      return null;
    values.set(key, segmentValue);
  }
  const frequency = values.get("FREQ");
  if (
    !frequency ||
    !RRULE_FREQUENCIES.includes(frequency as (typeof RRULE_FREQUENCIES)[number])
  ) {
    return null;
  }
  const interval = values.get("INTERVAL");
  if (
    interval &&
    (!/^\d+$/.test(interval) || Number(interval) < 1 || Number(interval) > 365)
  ) {
    return null;
  }
  const byDay = values.get("BYDAY");
  if (byDay) {
    const days = byDay.split(",");
    if (
      frequency === "DAILY" ||
      days.some(
        (day) => !RRULE_DAYS.includes(day as (typeof RRULE_DAYS)[number]),
      ) ||
      new Set(days).size !== days.length
    )
      return null;
  }
  const count = values.get("COUNT");
  if (
    count &&
    (!/^\d+$/.test(count) || Number(count) < 1 || Number(count) > 366)
  )
    return null;
  const untilValue = values.get("UNTIL");
  const until = untilValue ? parseUntil(untilValue) : null;
  if (untilValue && !until) return null;
  if ((!count && !until) || (count && until)) return null;
  if (until) {
    const first = new Date(firstOccurrence);
    const fiveYearsAfterFirst = new Date(first);
    fiveYearsAfterFirst.setUTCFullYear(
      fiveYearsAfterFirst.getUTCFullYear() + 5,
    );
    if (until < first || until > fiveYearsAfterFirst) return null;
  }
  return RRULE_KEYS.filter((key) => values.has(key))
    .map((key) => `${key}=${values.get(key)}`)
    .join(";");
}
function parseSchedule(
  value: unknown,
  detail: false,
): ActivitySchedulePreview | null;
function parseSchedule(value: unknown, detail: true): ActivitySchedule | null;
function parseSchedule(
  value: unknown,
  detail: boolean,
): ActivitySchedulePreview | ActivitySchedule | null {
  const source = record(value);
  const type = oneOf(source?.type, [
    "one_off",
    "recurring",
    "permanent",
  ] as const);
  if (!source || !type || !nullableText(source.recurrenceRule)) return null;
  const dates = parseArray(source.dates, parseActivityDate, detail ? 366 : 3);
  const exceptions = detail
    ? parseArray(source.exceptions, parseActivityException, 366)
    : [];
  if (!dates || !exceptions) return null;
  if (
    new Set(dates.map((date) => Date.parse(date.startsAt))).size !==
    dates.length
  )
    return null;
  if (
    detail &&
    new Set(exceptions.map((exception) => Date.parse(exception.excludedAt)))
      .size !== exceptions.length
  )
    return null;
  if (
    type === "permanent" &&
    (source.recurrenceRule !== null || dates.length || exceptions.length)
  )
    return null;
  if (type !== "permanent" && dates.length === 0) return null;
  if (
    type === "one_off" &&
    (source.recurrenceRule !== null || (detail && exceptions.length > 0))
  )
    return null;
  const recurrenceRule =
    type === "recurring"
      ? parseRecurrenceRule(
          source.recurrenceRule,
          new Date(
            Math.min(...dates.map((date) => Date.parse(date.startsAt))),
          ).toISOString(),
        )
      : null;
  if (type === "recurring" && !recurrenceRule) return null;
  return detail
    ? { type, recurrenceRule, dates, exceptions }
    : { type, recurrenceRule, dates };
}
const parseActivityBase = (value: unknown) => {
  const source = record(value);
  const id = nonEmpty(source?.id);
  const slug = nonEmpty(source?.slug);
  const title = nonEmpty(source?.title);
  const summary = text(source?.summary);
  const image = parseNullableImage(source?.image);
  const lifecycle = oneOf(source?.lifecycle, ["active", "archived"] as const);
  const publishedAt = timestamp(source?.publishedAt);
  if (
    !source ||
    !id ||
    !slug ||
    !title ||
    summary === null ||
    !nullableText(source.location) ||
    image === undefined ||
    !lifecycle ||
    !nullableInteger(source.featuredRank) ||
    !publishedAt
  )
    return null;
  return {
    id,
    slug,
    title,
    summary,
    location: source.location,
    image,
    lifecycle,
    featuredRank: source.featuredRank,
    publishedAt,
  };
};
const parseActivitySummary = (value: unknown) => {
  const source = record(value);
  const base = parseActivityBase(value);
  const schedule = parseSchedule(source?.schedule, false);
  return source && base && schedule ? { ...base, schedule } : null;
};
const parseActivityItem = (value: unknown) => {
  const source = record(value);
  const base = parseActivityBase(value);
  const bodyMarkdown = text(source?.bodyMarkdown);
  const schedule = parseSchedule(source?.schedule, true);
  return source && base && bodyMarkdown !== null && schedule
    ? { ...base, bodyMarkdown, schedule }
    : null;
};
const parseActivityContext = (source: RecordValue) => {
  const context = parseContext(source);
  return context && source.timeZone === "Europe/Zurich"
    ? { ...context, timeZone: "Europe/Zurich" as const }
    : null;
};
export const activitiesPayload: Parser<ActivitiesPayload> = (value) => {
  const source = record(value);
  const context = source && parseActivityContext(source);
  const activities = parseArray(source?.activities, parseActivitySummary, 50);
  return source && context && activities ? { ...context, activities } : null;
};
export const activityDetailPayload: Parser<ActivityDetailPayload> = (value) => {
  const source = record(value);
  const context = source && parseActivityContext(source);
  const activity = parseActivityItem(source?.activity);
  return source && context && activity ? { ...context, activity } : null;
};

const parseTopThreeBase = (value: unknown) => {
  const source = record(value);
  const id = nonEmpty(source?.id);
  const slug = nonEmpty(source?.slug);
  const theme = nonEmpty(source?.theme);
  const publishedAt = timestamp(source?.publishedAt);
  return source && id && slug && theme && publishedAt
    ? { id, slug, theme, publishedAt }
    : null;
};
const parseGameSummary = (value: unknown) => {
  const source = record(value);
  const name = nonEmpty(source?.name);
  return source && name ? { name } : null;
};
const parseGameDetail = (value: unknown) => {
  const source = record(value);
  const name = nonEmpty(source?.name);
  return source && name && nullableText(source.description)
    ? { name, description: source.description }
    : null;
};
const parseTopThreeSummary = (value: unknown) => {
  const source = record(value);
  const base = parseTopThreeBase(value);
  const games = parseArray(source?.games, parseGameSummary, 3);
  return source && base && games?.length === 3 ? { ...base, games } : null;
};
const parseTopThreeItem = (value: unknown) => {
  const source = record(value);
  const base = parseTopThreeBase(value);
  const games = parseArray(source?.games, parseGameDetail, 3);
  const sites = parseArray(source?.sites, parseSiteRef, 200);
  return source && base && games?.length === 3 && sites
    ? { ...base, games, sites }
    : null;
};
export const topThreesPayload: Parser<TopThreesPayload> = (value) => {
  const source = record(value);
  const context = source && parseContext(source);
  const topThrees = parseArray(source?.topThrees, parseTopThreeSummary, 50);
  return source && context && topThrees ? { ...context, topThrees } : null;
};
export const topThreeDetailPayload: Parser<TopThreeDetailPayload> = (value) => {
  const source = record(value);
  const context = source && parseContext(source);
  const topThree = parseTopThreeItem(source?.topThree);
  return source && context && topThree ? { ...context, topThree } : null;
};

const parseFaq = (value: unknown) => {
  const source = record(value);
  const id = nonEmpty(source?.id);
  const question = nonEmpty(source?.question);
  const answerMarkdown = nonEmpty(source?.answerMarkdown);
  const sortOrder = integer(source?.sortOrder);
  return source &&
    id &&
    question &&
    answerMarkdown &&
    nullableText(source.category) &&
    sortOrder !== null
    ? { id, question, answerMarkdown, category: source.category, sortOrder }
    : null;
};
export const faqsPayload: Parser<FaqsPayload> = (value) => {
  const source = record(value);
  const context = source && parseContext(source);
  const faqs = parseArray(source?.faqs, parseFaq, 200);
  return source && context && faqs ? { ...context, faqs } : null;
};

const parsePdf = (value: unknown) => {
  const source = record(value);
  const url = httpUrl(source?.url);
  const fileName = nonEmpty(source?.fileName);
  return source && url && fileName ? { url, fileName } : null;
};
const parseDocumentBase = (value: unknown) => {
  const source = record(value);
  const id = nonEmpty(source?.id);
  const slug = nonEmpty(source?.slug);
  const kind = oneOf(source?.kind, [
    "mission",
    "statutes",
    "annual_report",
    "other",
  ] as const);
  const title = nonEmpty(source?.title);
  const year = source && nullableInteger(source.year) ? source.year : undefined;
  const pdf = source?.pdf === null ? null : parsePdf(source?.pdf);
  const publishedAt = timestamp(source?.publishedAt);
  if (
    !source ||
    !id ||
    !slug ||
    !kind ||
    !title ||
    !nullableText(source.summary) ||
    year === undefined ||
    (year !== null && (year < 1000 || year > 9999)) ||
    (kind === "annual_report" && year === null) ||
    (kind !== "annual_report" && year !== null) ||
    (pdf === null && source.pdf !== null) ||
    !publishedAt
  )
    return null;
  return {
    id,
    slug,
    kind,
    title,
    summary: source.summary,
    year,
    pdf,
    publishedAt,
  };
};
const parseDocumentItem = (value: unknown) => {
  const source = record(value);
  const base = parseDocumentBase(value);
  const sites = parseArray(source?.sites, parseSiteRef, 200);
  if (!source || !base || !nullableText(source.bodyMarkdown) || !sites)
    return null;
  if (!nonEmpty(source.bodyMarkdown) && !base.pdf) return null;
  return { ...base, bodyMarkdown: source.bodyMarkdown, sites };
};
export const documentsPayload: Parser<DocumentsPayload> = (value) => {
  const source = record(value);
  const context = source && parseContext(source);
  const documents = parseArray(source?.documents, parseDocumentBase, 50);
  return source && context && documents ? { ...context, documents } : null;
};
export const documentDetailPayload: Parser<DocumentDetailPayload> = (value) => {
  const source = record(value);
  const context = source && parseContext(source);
  const document = parseDocumentItem(source?.document);
  return source && context && document ? { ...context, document } : null;
};

const parseGalleryImage = (value: unknown) => {
  const source = record(value);
  const id = nonEmpty(source?.id);
  const alt = nonEmpty(source?.alt);
  const sortOrder = integer(source?.sortOrder);
  const imageUrl = httpUrl(source?.imageUrl);
  const publishedAt = timestamp(source?.publishedAt);
  return source &&
    id &&
    nullableText(source.caption) &&
    alt &&
    sortOrder !== null &&
    imageUrl &&
    publishedAt
    ? { id, caption: source.caption, alt, sortOrder, imageUrl, publishedAt }
    : null;
};
export const galleryPayload: Parser<GalleryPayload> = (value) => {
  const source = record(value);
  const context = source && parseContext(source);
  const images = parseArray(source?.images, parseGalleryImage, 100);
  return source && context && images ? { ...context, images } : null;
};

const parseProfile = (value: unknown) => {
  const source = record(value);
  const id = nonEmpty(source?.id);
  const section = oneOf(source?.section, ["team", "committee"] as const);
  const displayName = nonEmpty(source?.displayName);
  const sortOrder = integer(source?.sortOrder);
  const photo = parseNullableImage(source?.photo);
  return source &&
    id &&
    section &&
    displayName &&
    nullableText(source.roleTitle) &&
    nullableText(source.bioMarkdown) &&
    sortOrder !== null &&
    photo !== undefined
    ? {
        id,
        section,
        displayName,
        roleTitle: source.roleTitle,
        bioMarkdown: source.bioMarkdown,
        sortOrder,
        photo,
      }
    : null;
};
export const profilesPayload: Parser<ProfilesPayload> = (value) => {
  const source = record(value);
  const context = source && parseContext(source);
  const section =
    source?.section === null
      ? null
      : oneOf(source?.section, ["team", "committee"] as const);
  const profiles = parseArray(source?.profiles, parseProfile, 200);
  if (!source || !context || !profiles) return null;
  if (source.section === null) return { ...context, section: null, profiles };
  return section ? { ...context, section, profiles } : null;
};

const parseDirectoryEntry = (value: unknown) => {
  const source = record(value);
  const id = nonEmpty(source?.id);
  const slug = nonEmpty(source?.slug);
  const name = nonEmpty(source?.name);
  const city = nonEmpty(source?.city);
  const website = source?.website === null ? null : httpUrl(source?.website);
  const directionsUrl = httpUrl(source?.directionsUrl);
  const officialUrl = httpUrl(source?.officialUrl);
  const sortOrder = integer(source?.sortOrder);
  if (
    !source ||
    !id ||
    !slug ||
    !name ||
    !city ||
    !nullableText(source.descriptionMarkdown) ||
    !nullableText(source.address) ||
    !nullableText(source.postalCode) ||
    !nullableText(source.phone) ||
    !nullableEmail(source.email) ||
    (website === null && source.website !== null) ||
    !directionsUrl ||
    !officialUrl ||
    sortOrder === null
  )
    return null;
  return {
    id,
    slug,
    name,
    descriptionMarkdown: source.descriptionMarkdown,
    address: source.address,
    postalCode: source.postalCode,
    city,
    phone: source.phone,
    email: source.email,
    website,
    directionsUrl,
    officialUrl,
    sortOrder,
  };
};
export const directoryPayload: Parser<DirectoryPayload> = (value) => {
  const source = record(value);
  const ludo = parseLudo(source?.ludo);
  const entries = parseArray(source?.entries, parseDirectoryEntry, 200);
  return source && ludo && entries ? { ludo, entries } : null;
};
