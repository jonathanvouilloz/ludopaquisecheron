import { ludohub, type LudoHubClient } from "../lib/ludohub";
import type {
  ActivitiesPayload,
  ActivityRegistration,
  DocumentsPayload,
  GalleryPayload,
  NewsPayload,
  ProfilesPayload,
  PublicPdfAttachment,
  PublicSupportImage,
  TopThreesPayload,
} from "../lib/ludohub";
import { markdownBlocks } from "../lib/editorial-markdown";

export type EditorialSource = {
  mode: "live" | "demo";
  notice: string | null;
  noindex: boolean;
  reason?: string;
};
export type EditorialCollection<T> = EditorialSource & { items: T[] };

export type NewsView = {
  slug: string;
  title: string;
  question: string;
  summary: string;
  image: { url: string; alt: string } | null;
  supportImage: PublicSupportImage | null;
  attachments: PublicPdfAttachment[];
  body: string[];
  dateLabel: string;
  location: string;
  status: "demo" | "live";
  detailAvailable: boolean;
};
export type ActivityView = NewsView & {
  audience: string;
  schedule: string;
  archived: boolean;
  featuredRank: number | null;
  registration: ActivityRegistration | null;
};

export function canRegisterForActivity(
  item: Pick<ActivityView, "archived" | "detailAvailable" | "registration">,
  sourceMode: EditorialSource["mode"],
): boolean {
  return (
    sourceMode === "live" &&
    !item.archived &&
    item.detailAvailable &&
    item.registration?.enabled === true
  );
}
export type TopThreeView = {
  slug: string;
  theme: string;
  isHomepage: boolean;
  dateLabel: string;
  games: Array<{ rank: number; name: string; reason: string }>;
};
export type GalleryView = {
  id: string;
  imageUrl: string | null;
  alt: string;
  caption: string;
  demo: boolean;
};
export type ProfileView = {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo: { url: string; alt: string } | null;
};
export type DocumentView = {
  slug: string;
  kind: "mission" | "statutes" | "annual_report" | "other";
  title: string;
  summary: string;
  year: number | null;
  body: string[];
  pdf: { url: string; fileName: string } | null;
  detailAvailable: boolean;
};

export const editorialNotice =
  "Mode démonstration : LudoHub n’est pas disponible. Ces contenus sont des exemples et ne constituent pas des informations confirmées.";

const demoNews: NewsView[] = [
  {
    slug: "bienvenue-sur-le-futur-site",
    title: "Bienvenue sur le futur site",
    question: "Qu’est-ce qui change sur le site ?",
    summary:
      "Un exemple de publication pour tester une information courte, datée et facile à partager.",
    image: null,
    supportImage: null,
    attachments: [],
    body: markdownBlocks(
      "Cette page montre la forme d’une future actualité. Son contenu n’annonce aucun changement réel.\n\nAprès validation, l’équipe publiera ici les fermetures, nouvelles et rendez-vous utiles aux familles.",
    ),
    dateLabel: "Date à confirmer",
    location: "Les deux lieux",
    status: "demo",
    detailAvailable: true,
  },
  {
    slug: "une-nouvelle-selection-de-jeux",
    title: "Une nouvelle sélection de jeux",
    question: "Quels jeux l’équipe pourrait-elle mettre en avant ?",
    summary:
      "Un second exemple pour vérifier l’affichage d’une actualité liée aux collections.",
    image: null,
    supportImage: null,
    attachments: [],
    body: markdownBlocks(
      "Les titres présentés ici sont provisoires et ne sont pas des recommandations publiées.",
    ),
    dateLabel: "Date à confirmer",
    location: "Pâquis",
    status: "demo",
    detailAvailable: true,
  },
];
const demoActivities: ActivityView[] = [
  {
    slug: "apres-midi-jeux-en-famille",
    title: "Après-midi jeux en famille",
    question: "Envie de découvrir un jeu ensemble ?",
    summary:
      "Une activité fictive utilisée pour tester une fiche avec public, horaire et lieu.",
    image: null,
    supportImage: null,
    attachments: [],
    body: markdownBlocks(
      "Cette activité n’est pas programmée. Elle illustre une future animation validée.",
    ),
    dateLabel: "Date à confirmer",
    location: "Sécheron",
    audience: "Familles — âge à confirmer",
    schedule: "Horaire à confirmer",
    status: "demo",
    archived: false,
    featuredRank: 1,
    registration: null,
    detailAvailable: true,
  },
];
const demoArchivedActivities: ActivityView[] = [
  {
    slug: "exemple-animation-archivee",
    title: "Exemple d’animation archivée",
    question: "À quoi ressemblera l’historique des activités ?",
    summary:
      "Un exemple explicitement fictif pour rendre l’état archive testable.",
    image: null,
    supportImage: null,
    attachments: [],
    body: markdownBlocks("Cette fiche ne correspond pas à une activité passée réelle."),
    dateLabel: "Exemple sans date réelle",
    location: "Les deux lieux",
    audience: "Public non défini",
    schedule: "Terminé — exemple",
    status: "demo",
    archived: true,
    featuredRank: null,
    registration: null,
    detailAvailable: true,
  },
];
const demoTopThree: TopThreeView[] = [
  {
    slug: "selection-demo",
    theme: "Sélection à venir",
    isHomepage: true,
    dateLabel: "Date à confirmer",
    games: [
      {
        rank: 1,
        name: "Jeu à sélectionner",
        reason: "L’équipe ajoutera ici son conseil.",
      },
      {
        rank: 2,
        name: "Deuxième choix à venir",
        reason: "Ce rang teste la hiérarchie.",
      },
      {
        rank: 3,
        name: "Troisième choix à venir",
        reason: "Aucun titre n’est recommandé.",
      },
    ],
  },
];
const demoGallery: GalleryView[] = [
  {
    id: "demo-1",
    imageUrl: null,
    alt: "Future photo des espaces",
    caption: "Les espaces de jeu",
    demo: true,
  },
  {
    id: "demo-2",
    imageUrl: null,
    alt: "Future photo d’une partie",
    caption: "Une table en activité",
    demo: true,
  },
  {
    id: "demo-3",
    imageUrl: null,
    alt: "Future photo de jeux",
    caption: "Les collections",
    demo: true,
  },
];
const demoTeam: ProfileView[] = [
  {
    id: "demo-team",
    name: "Portrait à venir",
    role: "Rôle à confirmer",
    bio: "La présentation sera publiée avec l’accord de la personne.",
    photo: null,
  },
];
const demoCommittee: ProfileView[] = [];
const demoDocuments: DocumentView[] = [
  {
    slug: "mission-demo",
    kind: "mission",
    title: "Notre mission",
    summary: "Formulation institutionnelle à valider.",
    year: null,
    body: markdownBlocks(
      "Rendre le jeu accessible dans les quartiers des Pâquis et de Sécheron.\n\nCréer un espace d’accueil, de découverte et de rencontre entre générations.\n\nConseiller les familles sans transformer le site en catalogue exhaustif.",
    ),
    pdf: null,
    detailAvailable: true,
  },
  {
    slug: "statuts-demo",
    kind: "statutes",
    title: "Statuts de l’association",
    summary: "Document à valider avant publication.",
    year: null,
    body: [],
    pdf: null,
    detailAvailable: false,
  },
  {
    slug: "rapport-demo",
    kind: "annual_report",
    title: "Rapport d’activité",
    summary: "Version publique à sélectionner.",
    year: 2025,
    body: [],
    pdf: null,
    detailAvailable: false,
  },
];

/** Exports statiques conservés pour les invariants de contenu et le mode démonstration. */
export const news = demoNews;
export const activities = demoActivities;
export const archivedActivities = demoArchivedActivities.map((item) => ({
  ...item,
  status: "archive" as const,
}));
export const committee = demoCommittee;
export const topGames = demoTopThree[0].games.map((game) => ({
  ...game,
  age: "Âge à confirmer",
}));

const FALLBACK_LUDO = {
  slug: "paquis-secheron",
  name: "Ludothèque Pâquis-Sécheron",
};
const DEMO_DATE = "2026-01-01T00:00:00.000Z";
const demoSource = (reason?: string): EditorialSource => ({
  mode: "demo",
  notice: editorialNotice,
  noindex: true,
  reason,
});
const liveSource = (): EditorialSource => ({
  mode: "live",
  notice: null,
  noindex: false,
});

export function markdownParagraphs(markdown: string | null): string[] {
  return markdownBlocks(markdown);
}
function dateLabel(value: string): string {
  return new Intl.DateTimeFormat("fr-CH", {
    dateStyle: "long",
    timeZone: "Europe/Zurich",
  }).format(new Date(value));
}
function locationLabel(
  sites: Array<{ name: string }>,
  fallback: string | null = null,
): string {
  if (sites.length === 0) return fallback || "Les deux lieux";
  return sites.map((site) => site.name).join(" et ");
}
function reasonOf(result: {
  source: string;
  reason?: string;
}): string | undefined {
  return "reason" in result ? result.reason : undefined;
}

const newsFallback: NewsPayload = {
  ludo: FALLBACK_LUDO,
  site: null,
  news: demoNews.map((item, index) => ({
    id: `demo-news-${index}`,
    slug: item.slug,
    title: item.title,
    summary: item.summary,
    image: null,
    publishedAt: DEMO_DATE,
  })),
};
export async function loadNews(
  client: LudoHubClient = ludohub,
): Promise<EditorialCollection<NewsView>> {
  const result = await client.news({ fallback: newsFallback });
  if (result.source !== "live")
    return { ...demoSource(reasonOf(result)), items: demoNews };
  return {
    ...liveSource(),
    items: result.data.news.map((item) => ({
      slug: item.slug,
      title: item.title,
      question: item.title,
      summary: item.summary,
      image: item.image,
      supportImage: null,
      attachments: [],
      body: [],
      dateLabel: dateLabel(item.publishedAt),
      location: result.data.site || "Les deux lieux",
      status: "live",
      detailAvailable: false,
    })),
  };
}
export async function loadNewsRoutes(
  client: LudoHubClient = ludohub,
): Promise<EditorialCollection<NewsView>> {
  const list = await loadNews(client);
  if (list.mode === "demo") return list;
  const items = await Promise.all(
    list.items.map(async (summary) => {
      const result = await client.newsDetail(summary.slug);
      if (result.source !== "live")
        return { ...summary, detailAvailable: false };
      const item = result.data.news;
      return {
        ...summary,
        title: item.title,
        question: item.title,
        summary: item.summary,
        supportImage: item.supportImage,
        attachments: item.attachments,
        body: markdownParagraphs(item.bodyMarkdown),
        dateLabel: dateLabel(item.publishedAt),
        location: locationLabel(item.sites),
        detailAvailable: true,
      };
    }),
  );
  return { ...list, items };
}

export async function loadNewsDetail(
  slug: string,
  client: LudoHubClient = ludohub,
): Promise<(EditorialSource & { item: NewsView }) | null> {
  const result = await client.newsDetail(slug);
  if (result.source !== "live") return null;
  const item = result.data.news;
  return {
    ...liveSource(),
    item: {
      slug: item.slug,
      title: item.title,
      question: item.title,
      summary: item.summary,
      image: item.image,
      supportImage: item.supportImage,
      attachments: item.attachments,
      body: markdownParagraphs(item.bodyMarkdown),
      dateLabel: dateLabel(item.publishedAt),
      location: locationLabel(item.sites),
      status: "live",
      detailAvailable: true,
    },
  };
}

function activityFallback(items: ActivityView[]): ActivitiesPayload {
  return {
    ludo: FALLBACK_LUDO,
    site: null,
    timeZone: "Europe/Zurich",
    activities: items.map((item, index) => ({
      id: `demo-activity-${index}`,
      slug: item.slug,
      title: item.title,
      summary: item.summary,
      location: item.location,
      image: null,
      lifecycle: item.archived ? "archived" : "active",
      featuredRank: null,
      publishedAt: DEMO_DATE,
      schedule: { type: "permanent", recurrenceRule: null, dates: [] },
    })),
  };
}
function scheduleLabel(
  dates: Array<{ startsAt: string }>,
  type: string,
): string {
  if (type === "permanent") return "Accessible en permanence";
  return dates.length ? dateLabel(dates[0].startsAt) : "Date à confirmer";
}
export async function loadActivities(
  archived = false,
  client: LudoHubClient = ludohub,
): Promise<EditorialCollection<ActivityView>> {
  const fallbackItems = archived ? demoArchivedActivities : demoActivities;
  const result = archived
    ? await client.archivedActivities({
        fallback: activityFallback(fallbackItems),
      })
    : await client.activities({ fallback: activityFallback(fallbackItems) });
  if (result.source !== "live")
    return { ...demoSource(reasonOf(result)), items: fallbackItems };
  return {
    ...liveSource(),
    items: result.data.activities.map((item) => ({
      slug: item.slug,
      title: item.title,
      question: item.title,
      summary: item.summary,
      image: item.image,
      supportImage: null,
      attachments: [],
      body: [],
      dateLabel: scheduleLabel(item.schedule.dates, item.schedule.type),
      location: item.location || result.data.site || "Les deux lieux",
      audience: "Tout public",
      schedule: scheduleLabel(item.schedule.dates, item.schedule.type),
      status: "live",
      archived: item.lifecycle === "archived",
      featuredRank: item.featuredRank,
      registration: null,
      detailAvailable: false,
    })),
  };
}
export async function loadActivityRoutes(
  client: LudoHubClient = ludohub,
): Promise<EditorialCollection<ActivityView>> {
  const [current, archived] = await Promise.all([
    loadActivities(false, client),
    loadActivities(true, client),
  ]);
  if (current.mode === "demo" || archived.mode === "demo")
    return {
      ...demoSource(current.reason ?? archived.reason),
      items: [...demoActivities, ...demoArchivedActivities],
    };
  const summaries = [...current.items, ...archived.items];
  const items = await Promise.all(
    summaries.map(async (summary) => {
      const result = await client.activityDetail(summary.slug);
      if (result.source !== "live") return summary;
      const item = result.data.activity;
      return {
        ...summary,
        title: item.title,
        question: item.title,
        summary: item.summary,
        supportImage: item.supportImage,
        attachments: item.attachments,
        body: markdownParagraphs(item.bodyMarkdown),
        location: item.location || result.data.site || "Les deux lieux",
        schedule: scheduleLabel(item.schedule.dates, item.schedule.type),
        dateLabel: scheduleLabel(item.schedule.dates, item.schedule.type),
        archived: item.lifecycle === "archived",
        registration: item.registration,
        detailAvailable: true,
      };
    }),
  );
  return { ...liveSource(), items };
}

export async function loadActivityDetail(
  slug: string,
  client: LudoHubClient = ludohub,
): Promise<(EditorialSource & { item: ActivityView }) | null> {
  const result = await client.activityDetail(slug);
  if (result.source !== "live") return null;
  const item = result.data.activity;
  return {
    ...liveSource(),
    item: {
      slug: item.slug,
      title: item.title,
      question: item.title,
      summary: item.summary,
      image: item.image,
      supportImage: item.supportImage,
      attachments: item.attachments,
      body: markdownParagraphs(item.bodyMarkdown),
      dateLabel: scheduleLabel(item.schedule.dates, item.schedule.type),
      location: item.location || result.data.site || "Les deux lieux",
      audience: "Tout public",
      schedule: scheduleLabel(item.schedule.dates, item.schedule.type),
      status: "live",
      archived: item.lifecycle === "archived",
      featuredRank: item.featuredRank,
      registration: item.registration,
      detailAvailable: true,
    },
  };
}

const topFallback: TopThreesPayload = {
  ludo: FALLBACK_LUDO,
  site: null,
  topThrees: demoTopThree.map((item) => ({
    id: item.slug,
    slug: item.slug,
    theme: item.theme,
    isHomepage: item.isHomepage,
    games: item.games.map(({ name }) => ({ name })),
    publishedAt: DEMO_DATE,
  })),
};
export async function loadTopThrees(
  client: LudoHubClient = ludohub,
): Promise<EditorialCollection<TopThreeView>> {
  const result = await client.topThrees({ fallback: topFallback });
  if (result.source !== "live")
    return { ...demoSource(reasonOf(result)), items: demoTopThree };
  const items = await Promise.all(
    result.data.topThrees.map(async (summary) => {
      const detail = await client.topThreeDetail(summary.slug);
      const games =
        detail.source === "live"
          ? detail.data.topThree.games
          : summary.games.map((game) => ({ ...game, description: null }));
      return {
        slug: summary.slug,
        theme: summary.theme,
        isHomepage: summary.isHomepage,
        dateLabel: dateLabel(summary.publishedAt),
        games: games.map((game, index) => ({
          rank: index + 1,
          name: game.name,
          reason: game.description || "Conseil de l’équipe",
        })),
      };
    }),
  );
  return { ...liveSource(), items };
}

const galleryFallback: GalleryPayload = {
  ludo: FALLBACK_LUDO,
  site: null,
  images: [],
};
export async function loadGallery(
  client: LudoHubClient = ludohub,
): Promise<EditorialCollection<GalleryView>> {
  const result = await client.gallery({ fallback: galleryFallback });
  if (result.source !== "live")
    return { ...demoSource(reasonOf(result)), items: demoGallery };
  return {
    ...liveSource(),
    items: result.data.images.map((item) => ({
      id: item.id,
      imageUrl: item.imageUrl,
      alt: item.alt,
      caption: item.caption || item.alt,
      demo: false,
    })),
  };
}

function profilesFallback(
  section: "team" | "committee",
  items: ProfileView[],
): ProfilesPayload {
  return {
    ludo: FALLBACK_LUDO,
    site: null,
    section,
    profiles: items.map((item, index) => ({
      id: `demo-${section}-${index}`,
      section,
      displayName: item.name,
      roleTitle: item.role,
      bioMarkdown: item.bio,
      sortOrder: index,
      photo: null,
    })),
  };
}
export async function loadProfiles(
  section: "team" | "committee",
  client: LudoHubClient = ludohub,
): Promise<EditorialCollection<ProfileView>> {
  const fallbackItems = section === "team" ? demoTeam : demoCommittee;
  const result = await client.profiles({
    section,
    fallback: profilesFallback(section, fallbackItems),
  });
  if (result.source !== "live")
    return { ...demoSource(reasonOf(result)), items: fallbackItems };
  return {
    ...liveSource(),
    items: result.data.profiles.map((item) => ({
      id: item.id,
      name: item.displayName,
      role: item.roleTitle || (section === "team" ? "Équipe" : "Comité"),
      bio: item.bioMarkdown || "",
      photo: item.photo,
    })),
  };
}

const documentsFallback: DocumentsPayload = {
  ludo: FALLBACK_LUDO,
  site: null,
  documents: demoDocuments.map((item, index) => ({
    id: `demo-document-${index}`,
    slug: item.slug,
    kind: item.kind,
    title: item.title,
    summary: item.summary,
    year: item.year,
    pdf: null,
    publishedAt: DEMO_DATE,
  })),
};
export async function loadDocuments(
  client: LudoHubClient = ludohub,
): Promise<EditorialCollection<DocumentView>> {
  const result = await client.documents({ fallback: documentsFallback });
  if (result.source !== "live")
    return { ...demoSource(reasonOf(result)), items: demoDocuments };
  const items = await Promise.all(
    result.data.documents.map(async (summary) => {
      const detail = await client.documentDetail(summary.slug);
      return {
        slug: summary.slug,
        kind: summary.kind,
        title: summary.title,
        summary: summary.summary || "",
        year: summary.year,
        body:
          detail.source === "live"
            ? markdownParagraphs(detail.data.document.bodyMarkdown)
            : [],
        pdf: summary.pdf,
        detailAvailable: detail.source === "live",
      };
    }),
  );
  return { ...liveSource(), items };
}
