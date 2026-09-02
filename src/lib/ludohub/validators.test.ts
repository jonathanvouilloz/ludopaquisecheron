import { describe, expect, it } from "vitest";
import {
  activitiesPayload,
  activityDetailPayload,
  announcementsPayload,
  directoryPayload,
  documentDetailPayload,
  documentsPayload,
  faqsPayload,
  galleryPayload,
  newsPayload,
  profilesPayload,
  sitesPayload,
  topThreeDetailPayload,
  topThreesPayload,
} from "./validators.js";

const ludo = { slug: "paquis-secheron", name: "Pâquis-Sécheron" };
const context = { ludo, site: null };
const publishedAt = "2026-08-05T12:30:00+02:00";
const siteRef = { id: "site-a", slug: "paquis", name: "Pâquis" };
const image = {
  url: "https://cdn.example/image.webp",
  alt: "Jeux sur une table",
};

const activityBase = {
  id: "activity-a",
  slug: "atelier-jeux",
  title: "Atelier jeux",
  summary: "Un atelier.",
  location: null,
  image,
  lifecycle: "active",
  featuredRank: null,
  publishedAt,
};
const oneOffSchedule = {
  type: "one_off",
  recurrenceRule: null,
  dates: [{ startsAt: publishedAt, endsAt: "2026-08-05T14:30:00+02:00" }],
};
const activityRegistration = {
  enabled: true,
  capacity: null,
  isAtCapacity: false,
  fullMessage: null,
};

describe("projection récursive", () => {
  it("recrée le payload et supprime les clés inconnues à tous les niveaux", () => {
    const remote = {
      privateToken: "root-secret",
      ludo: { ...ludo, passwordHash: "secret" },
      sites: [
        {
          ...siteRef,
          internalNotes: "secret",
          address: "1 rue du Jeu",
          postalCode: "1201",
          city: "Genève",
          phone: null,
          email: "contact@example.ch",
          accessInfo: null,
          latitude: 46.21,
          longitude: 6.14,
          isPrimary: true,
          sortOrder: 0,
          openingIntervals: [
            {
              dayOfWeek: 2,
              opensAt: "14:00",
              closesAt: "18:00",
              staffOnly: "secret",
            },
          ],
        },
      ],
    };
    const parsed = sitesPayload(remote);

    expect(parsed).toEqual({
      ludo,
      sites: [
        {
          ...siteRef,
          address: "1 rue du Jeu",
          postalCode: "1201",
          city: "Genève",
          phone: null,
          email: "contact@example.ch",
          accessInfo: null,
          latitude: 46.21,
          longitude: 6.14,
          isPrimary: true,
          sortOrder: 0,
          openingIntervals: [
            { dayOfWeek: 2, opensAt: "14:00", closesAt: "18:00" },
          ],
        },
      ],
    });
    expect(parsed).not.toBe(remote);
    expect(parsed?.ludo).not.toBe(remote.ludo);
    expect(parsed?.sites[0]).not.toBe(remote.sites[0]);
    expect(parsed?.sites[0].openingIntervals[0]).not.toBe(
      remote.sites[0].openingIntervals[0],
    );
    expect(JSON.stringify(parsed)).not.toContain("secret");
  });
});

describe("sites, annonces et actualités", () => {
  it("refuse heures, chevauchements et timestamps non contractuels", () => {
    const baseSite = {
      ...siteRef,
      address: null,
      postalCode: null,
      city: null,
      phone: null,
      email: null,
      accessInfo: null,
      latitude: null,
      longitude: null,
      isPrimary: true,
      sortOrder: 0,
    };
    expect(
      sitesPayload({
        ludo,
        sites: [
          {
            ...baseSite,
            openingIntervals: [
              { dayOfWeek: 1, opensAt: "9:00", closesAt: "12:00" },
            ],
          },
        ],
      }),
    ).toBeNull();
    expect(
      sitesPayload({
        ludo,
        sites: [
          {
            ...baseSite,
            openingIntervals: [
              { dayOfWeek: 1, opensAt: "11:00", closesAt: "15:00" },
              { dayOfWeek: 1, opensAt: "09:00", closesAt: "12:00" },
            ],
          },
        ],
      }),
    ).toBeNull();
    expect(
      announcementsPayload({
        ...context,
        announcements: [
          {
            id: "a",
            title: "Info",
            message: "Texte",
            publishedAt: "2026-08-05",
            sites: [],
          },
        ],
      }),
    ).toBeNull();
    expect(
      newsPayload({
        ...context,
        news: [
          {
            id: "n",
            slug: "news",
            title: "News",
            summary: "",
            image: { url: "https://x.test/a", alt: "" },
            publishedAt,
          },
        ],
      }),
    ).toBeNull();
    expect(
      directoryPayload({
        ludo,
        entries: [
          {
            id: "e",
            slug: "partenaire",
            name: "Partenaire",
            descriptionMarkdown: null,
            address: null,
            postalCode: null,
            city: "Genève",
            phone: null,
            email: null,
            website: null,
            directionsUrl: "https://maps.example/e",
            officialUrl: null,
            sortOrder: 0,
          },
        ],
      }),
    ).toMatchObject({ entries: [{ officialUrl: null }] });
  });
});

describe("activités", () => {
  it.each([0, -1, 4, "1"])("rejette featuredRank=%s hors du contrat 1..3", (featuredRank) => {
    expect(
      activitiesPayload({
        ...context,
        timeZone: "Europe/Zurich",
        activities: [{ ...activityBase, featuredRank, schedule: oneOffSchedule }],
      }),
    ).toBeNull();
  });

  it.each([null, 1, 2, 3])("accepte featuredRank=%s", (featuredRank) => {
    expect(
      activitiesPayload({
        ...context,
        timeZone: "Europe/Zurich",
        activities: [{ ...activityBase, featuredRank, schedule: oneOffSchedule }],
      }),
    ).not.toBeNull();
  });

  it("borne les aperçus à 3 dates et les détails à 366 dates/exceptions", () => {
    expect(
      activitiesPayload({
        ...context,
        timeZone: "Europe/Zurich",
        activities: [
          {
            ...activityBase,
            schedule: {
              ...oneOffSchedule,
              dates: Array(4).fill(oneOffSchedule.dates[0]),
            },
          },
        ],
      }),
    ).toBeNull();
    expect(
      activityDetailPayload({
        ...context,
        timeZone: "Europe/Zurich",
        activity: {
          ...activityBase,
          bodyMarkdown: "Détail",
          registration: activityRegistration,
          schedule: {
            ...oneOffSchedule,
            dates: Array(367).fill(oneOffSchedule.dates[0]),
            exceptions: [],
          },
        },
      }),
    ).toBeNull();
  });

  it("impose un horaire permanent sans dates, exceptions ni récurrence", () => {
    expect(
      activityDetailPayload({
        ...context,
        timeZone: "Europe/Zurich",
        activity: {
          ...activityBase,
          bodyMarkdown: "Détail",
          registration: activityRegistration,
          schedule: {
            type: "permanent",
            recurrenceRule: null,
            dates: [oneOffSchedule.dates[0]],
            exceptions: [],
          },
        },
      }),
    ).toBeNull();
  });
});

describe("tops trois", () => {
  const game = { name: "Jeu", description: null };

  it("exige exactement trois jeux en liste et en détail", () => {
    expect(
      topThreesPayload({
        ...context,
        topThrees: [
          {
            id: "t",
            slug: "top",
            theme: "Coop",
            isHomepage: false,
            publishedAt,
            games: [{ name: "A" }, { name: "B" }],
          },
        ],
      }),
    ).toBeNull();
    expect(
      topThreeDetailPayload({
        ...context,
        topThree: {
          id: "t",
          slug: "top",
          theme: "Coop",
          isHomepage: true,
          publishedAt,
          games: [game, game, game, game],
          sites: [],
        },
      }),
    ).toBeNull();
  });

  it("exige et projette strictement isHomepage dans la liste et le détail", () => {
    const summary = {
      id: "t",
      slug: "top",
      theme: "Coop",
      isHomepage: true,
      publishedAt,
      games: [
        { name: "A", image: null },
        { name: "B", image: null },
        { name: "C", image: null },
      ],
      internalFlag: "privé",
    };
    const parsedList = topThreesPayload({ ...context, topThrees: [summary] });
    expect(parsedList?.topThrees[0]).toEqual({
      id: "t",
      slug: "top",
      theme: "Coop",
      isHomepage: true,
      publishedAt,
      games: [
        { name: "A", image: null },
        { name: "B", image: null },
        { name: "C", image: null },
      ],
    });
    expect(topThreesPayload({ ...context, topThrees: [{ ...summary, isHomepage: undefined }] })).toBeNull();
    expect(topThreesPayload({ ...context, topThrees: [{ ...summary, isHomepage: "true" }] })).toBeNull();

    const detail = {
      ...summary,
      games: [game, game, game],
      sites: [],
    };
    expect(topThreeDetailPayload({ ...context, topThree: detail })?.topThree.isHomepage).toBe(true);
    expect(topThreeDetailPayload({ ...context, topThree: { ...detail, isHomepage: null } })).toBeNull();
  });
});

describe("documents", () => {
  const base = {
    id: "d",
    slug: "rapport",
    kind: "annual_report",
    title: "Rapport",
    summary: null,
    year: 2025,
    pdf: null,
    publishedAt,
  };

  it("valide type/année et exige du contenu ou un PDF en détail", () => {
    expect(
      documentsPayload({ ...context, documents: [{ ...base, year: null }] }),
    ).toBeNull();
    expect(
      documentDetailPayload({
        ...context,
        document: { ...base, bodyMarkdown: "", sites: [] },
      }),
    ).toBeNull();
    expect(
      documentDetailPayload({
        ...context,
        document: { ...base, bodyMarkdown: "# Rapport", sites: [] },
      }),
    ).not.toBeNull();
  });
});

describe("FAQ, galerie, profils et annuaire", () => {
  it("applique les limites et exige des images complètes et URLs publiques", () => {
    const faq = {
      id: "f",
      question: "Question ?",
      answerMarkdown: "Réponse",
      category: null,
      sortOrder: 0,
    };
    expect(faqsPayload({ ...context, faqs: Array(201).fill(faq) })).toBeNull();
    expect(
      galleryPayload({
        ...context,
        images: [
          {
            id: "i",
            caption: null,
            alt: "",
            sortOrder: 0,
            imageUrl: image.url,
            publishedAt,
          },
        ],
      }),
    ).toBeNull();
    expect(
      profilesPayload({
        ...context,
        section: null,
        profiles: [
          {
            id: "p",
            section: "team",
            displayName: "Ada",
            roleTitle: null,
            bioMarkdown: null,
            sortOrder: 0,
            photo: { url: "javascript:alert(1)", alt: "Ada" },
          },
        ],
      }),
    ).toBeNull();
    expect(
      directoryPayload({
        ludo,
        entries: [
          {
            id: "e",
            slug: "partenaire",
            name: "Partenaire",
            descriptionMarkdown: null,
            address: null,
            postalCode: null,
            city: "Genève",
            phone: null,
            email: null,
            website: null,
            directionsUrl: "https://maps.example/e",
            officialUrl: "ftp://example.test",
            sortOrder: 0,
          },
        ],
      }),
    ).toBeNull();
  });
});
