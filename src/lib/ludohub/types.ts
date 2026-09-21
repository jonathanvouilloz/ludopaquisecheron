export type LudoHubSource = "live" | "fallback" | "empty" | "unavailable";
export type LudoHubFailureReason =
  | "not_configured"
  | "invalid_config"
  | "not_found"
  | "timeout"
  | "network"
  | "http_error"
  | "invalid_response"
  | "invalid_request";

export type LudoHubResult<T> =
  | { source: "live"; data: T }
  | {
      source: "fallback";
      data: T;
      reason: LudoHubFailureReason;
      status?: number;
    }
  | {
      source: "empty";
      data: null;
      reason: "not_configured" | "not_found";
      status?: 404;
    }
  | {
      source: "unavailable";
      data: null;
      reason: Exclude<LudoHubFailureReason, "not_configured" | "not_found">;
      status?: number;
    };

export type Ludo = { slug: string; name: string };
export type PublicSiteRef = { id: string; slug: string; name: string };
export type PublicImage = { url: string; alt: string };
export type PublicSupportImage = PublicImage & {
  caption: string | null;
  credit: string | null;
};
export type PublicPdfAttachment = {
  id: string;
  title: string;
  fileName: string;
  viewUrl: string;
  downloadUrl: string;
  sizeBytes: number;
};

export type OpeningInterval = {
  dayOfWeek: number;
  opensAt: string;
  closesAt: string;
};
export type LudoSite = PublicSiteRef & {
  address: string | null;
  postalCode: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  accessInfo: string | null;
  latitude: number | null;
  longitude: number | null;
  isPrimary: boolean;
  sortOrder: number;
  openingIntervals: OpeningInterval[];
};
export type SitesPayload = { ludo: Ludo; sites: LudoSite[] };

export type Announcement = {
  id: string;
  title: string;
  message: string;
  publishedAt: string;
  sites: PublicSiteRef[];
};
export type AnnouncementsPayload = {
  ludo: Ludo;
  site: string | null;
  announcements: Announcement[];
};

export type NewsSummary = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  image: PublicImage | null;
  publishedAt: string;
};
export type NewsItem = NewsSummary & {
  bodyMarkdown: string;
  sites: PublicSiteRef[];
  supportImage: PublicSupportImage | null;
  attachments: PublicPdfAttachment[];
};
export type NewsPayload = {
  ludo: Ludo;
  site: string | null;
  news: NewsSummary[];
};
export type NewsDetailPayload = Omit<NewsPayload, "news"> & { news: NewsItem };

export type ActivitySchedule = {
  type: "one_off" | "recurring" | "permanent";
  recurrenceRule: string | null;
  dates: Array<{ startsAt: string; endsAt: string | null }>;
  exceptions: Array<{ excludedAt: string; reason: string | null }>;
};
export type ActivitySchedulePreview = Omit<ActivitySchedule, "exceptions">;
export type ActivityRegistration = {
  enabled: boolean;
  capacity: number | null;
  isAtCapacity: boolean;
  fullMessage: string | null;
};
export type ActivitySummary = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  location: string | null;
  image: PublicImage | null;
  lifecycle: "active" | "archived";
  featuredRank: number | null;
  publishedAt: string;
  schedule: ActivitySchedulePreview;
};
export type ActivityItem = Omit<ActivitySummary, "schedule"> & {
  bodyMarkdown: string;
  supportImage: PublicSupportImage | null;
  supportImages: PublicSupportImage[];
  attachments: PublicPdfAttachment[];
  schedule: ActivitySchedule;
  registration: ActivityRegistration;
};
export type ActivitiesPayload = {
  ludo: Ludo;
  site: string | null;
  timeZone: "Europe/Zurich";
  activities: ActivitySummary[];
};
export type ActivityDetailPayload = Omit<ActivitiesPayload, "activities"> & {
  activity: ActivityItem;
};
export type ActivityRegistrationReceipt = {
  accepted: true;
  receiptId: string;
  status: "received" | "waitlisted";
  message: string;
};

export type TopThreeSummary = {
  id: string;
  slug: string;
  theme: string;
  isHomepage: boolean;
  games: Array<{ name: string; image: PublicImage | null }>;
  publishedAt: string;
};
export type TopThreeItem = Omit<TopThreeSummary, "games"> & {
  games: Array<{
    name: string;
    description: string | null;
    image: PublicImage | null;
  }>;
  sites: PublicSiteRef[];
};
export type TopThreesPayload = {
  ludo: Ludo;
  site: string | null;
  topThrees: TopThreeSummary[];
};
export type TopThreeDetailPayload = Omit<TopThreesPayload, "topThrees"> & {
  topThree: TopThreeItem;
};

export type Faq = {
  id: string;
  question: string;
  answerMarkdown: string;
  category: string | null;
  sortOrder: number;
};
export type FaqsPayload = { ludo: Ludo; site: string | null; faqs: Faq[] };

export type DocumentSummary = {
  id: string;
  slug: string;
  kind: "mission" | "statutes" | "annual_report" | "other";
  title: string;
  summary: string | null;
  year: number | null;
  pdf: { url: string; fileName: string } | null;
  publishedAt: string;
};
export type DocumentItem = DocumentSummary & {
  bodyMarkdown: string | null;
  sites: PublicSiteRef[];
};
export type DocumentsPayload = {
  ludo: Ludo;
  site: string | null;
  documents: DocumentSummary[];
};
export type DocumentDetailPayload = Omit<DocumentsPayload, "documents"> & {
  document: DocumentItem;
};

export type GalleryImage = {
  id: string;
  caption: string | null;
  alt: string;
  sortOrder: number;
  imageUrl: string;
  publishedAt: string;
};
export type GalleryPayload = {
  ludo: Ludo;
  site: string | null;
  images: GalleryImage[];
};

export type Profile = {
  id: string;
  section: "team" | "committee";
  displayName: string;
  roleTitle: string | null;
  bioMarkdown: string | null;
  sortOrder: number;
  photo: PublicImage | null;
};
export type ProfilesPayload = {
  ludo: Ludo;
  site: string | null;
  section: "team" | "committee" | null;
  profiles: Profile[];
};

export type DirectoryEntry = {
  id: string;
  slug: string;
  name: string;
  descriptionMarkdown: string | null;
  address: string | null;
  postalCode: string | null;
  city: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  directionsUrl: string;
  officialUrl: string | null;
  sortOrder: number;
};
export type DirectoryPayload = { ludo: Ludo; entries: DirectoryEntry[] };

export type ContactRecipient = "paquis" | "secheron" | "general";
export type PublicContactSubmission = {
  recipient: ContactRecipient;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  /** Honeypot : doit rester vide pour un visiteur humain. */
  website?: string;
};
