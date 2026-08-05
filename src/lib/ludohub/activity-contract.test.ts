import { describe, expect, it } from "vitest";
import {
  activityDetailPayload,
  activityRegistrationReceipt,
  ACTIVITY_RECEIVED_MESSAGE,
  ACTIVITY_WAITLIST_MESSAGE,
  documentsPayload,
} from "./validators.js";

const ludo = { slug: "paquis-secheron", name: "Pâquis-Sécheron" };
const context = { ludo, site: null };
const occurrence = { startsAt: "2026-09-01T10:00:00.000Z", endsAt: null };
const activityBase = {
  id: "activity-a",
  slug: "atelier-jeux",
  title: "Atelier jeux",
  summary: "Un atelier.",
  location: null,
  image: null,
  lifecycle: "active",
  featuredRank: null,
  publishedAt: "2026-08-05T12:30:00+02:00",
  bodyMarkdown: "Détail",
  registration: {
    enabled: true,
    capacity: 12,
    isAtCapacity: false,
    fullMessage: null,
  },
};
const detailWith = (schedule: Record<string, unknown>) => ({
  ...context,
  timeZone: "Europe/Zurich",
  activity: { ...activityBase, schedule },
});

describe("contrat d'inscription aux activités", () => {
  it("exige et projette les informations publiques d'inscription", () => {
    const parsed = activityDetailPayload(
      detailWith({ type: "permanent", recurrenceRule: null, dates: [], exceptions: [] }),
    );
    expect(parsed?.activity.registration).toEqual(activityBase.registration);
    expect(activityDetailPayload({
      ...parsed,
      activity: { ...parsed?.activity, registration: undefined },
    })).toBeNull();
    expect(activityDetailPayload({
      ...parsed,
      activity: {
        ...parsed?.activity,
        registration: {
          ...activityBase.registration,
          isAtCapacity: true,
          fullMessage: ACTIVITY_WAITLIST_MESSAGE,
        },
      },
    })).not.toBeNull();
    expect(activityDetailPayload({
      ...parsed,
      activity: {
        ...parsed?.activity,
        registration: {
          ...activityBase.registration,
          isAtCapacity: true,
          fullMessage: "Texte distant arbitraire",
        },
      },
    })).toBeNull();
    expect(activityDetailPayload({
      ...parsed,
      activity: {
        ...parsed?.activity,
        registration: { ...activityBase.registration, isAtCapacity: true },
      },
    })).toBeNull();
    expect(activityDetailPayload({
      ...parsed,
      activity: {
        ...parsed?.activity,
        registration: {
          enabled: false,
          capacity: null,
          isAtCapacity: false,
          fullMessage: null,
        },
      },
    })).not.toBeNull();
    expect(activityDetailPayload({
      ...parsed,
      activity: {
        ...parsed?.activity,
        lifecycle: "archived",
        registration: activityBase.registration,
      },
    })).toBeNull();
    expect(activityDetailPayload({
      ...parsed,
      activity: {
        ...parsed?.activity,
        registration: { ...activityBase.registration, capacity: 0 },
      },
    })).toBeNull();
  });

  it("n'accepte qu'un reçu strict received ou waitlisted", () => {
    const valid = {
      accepted: true,
      receiptId: "registration-42",
      status: "waitlisted",
      message: ACTIVITY_WAITLIST_MESSAGE,
      internal: "secret",
    };
    expect(activityRegistrationReceipt(valid)).toEqual({
      accepted: true,
      receiptId: "registration-42",
      status: "waitlisted",
      message: ACTIVITY_WAITLIST_MESSAGE,
    });
    expect(activityRegistrationReceipt({ ...valid, accepted: false })).toBeNull();
    expect(activityRegistrationReceipt({ ...valid, receiptId: "" })).toBeNull();
    expect(activityRegistrationReceipt({ ...valid, status: "confirmed" })).toBeNull();
    expect(activityRegistrationReceipt({
      ...valid,
      status: "received",
      message: ACTIVITY_WAITLIST_MESSAGE,
    })).toBeNull();
    expect(activityRegistrationReceipt({
      ...valid,
      status: "received",
      message: ACTIVITY_RECEIVED_MESSAGE,
    })).toMatchObject({ status: "received", message: ACTIVITY_RECEIVED_MESSAGE });
    expect(activityRegistrationReceipt({
      ...valid,
      message: `${ACTIVITY_WAITLIST_MESSAGE} secret`,
    })).toBeNull();
    expect(ACTIVITY_WAITLIST_MESSAGE.match(/Nous vous contacterons si une place se libère\./g)).toHaveLength(1);
  });
});

describe("contrat précis des calendriers d'activité", () => {
  it("impose une date et aucune exception aux activités ponctuelles", () => {
    expect(
      activityDetailPayload(
        detailWith({
          type: "one_off",
          recurrenceRule: null,
          dates: [],
          exceptions: [],
        }),
      ),
    ).toBeNull();
    expect(
      activityDetailPayload(
        detailWith({
          type: "one_off",
          recurrenceRule: null,
          dates: [occurrence],
          exceptions: [{ excludedAt: occurrence.startsAt, reason: null }],
        }),
      ),
    ).toBeNull();
  });

  it("impose zéro date, exception et RRULE aux activités permanentes", () => {
    expect(
      activityDetailPayload(
        detailWith({
          type: "permanent",
          recurrenceRule: null,
          dates: [],
          exceptions: [],
        }),
      ),
    ).not.toBeNull();
    for (const schedule of [
      {
        type: "permanent",
        recurrenceRule: "FREQ=DAILY;COUNT=2",
        dates: [],
        exceptions: [],
      },
      {
        type: "permanent",
        recurrenceRule: null,
        dates: [occurrence],
        exceptions: [],
      },
      {
        type: "permanent",
        recurrenceRule: null,
        dates: [],
        exceptions: [{ excludedAt: occurrence.startsAt, reason: null }],
      },
    ])
      expect(activityDetailPayload(detailWith(schedule))).toBeNull();
  });

  it("normalise une RRULE valide et accepte les bornes COUNT/UNTIL du service", () => {
    const withCount = activityDetailPayload(
      detailWith({
        type: "recurring",
        recurrenceRule: "freq=weekly;interval=365;byday=MO,WE;count=366",
        dates: [occurrence],
        exceptions: [],
      }),
    );
    expect(withCount?.activity.schedule.recurrenceRule).toBe(
      "FREQ=WEEKLY;INTERVAL=365;BYDAY=MO,WE;COUNT=366",
    );
    expect(
      activityDetailPayload(
        detailWith({
          type: "recurring",
          recurrenceRule: "FREQ=YEARLY;UNTIL=20310901T100000Z",
          dates: [occurrence],
          exceptions: [],
        }),
      ),
    ).not.toBeNull();
  });

  it.each([
    "FREQ=HOURLY;COUNT=2",
    "FREQ=WEEKLY;INTERVAL=0;COUNT=2",
    "FREQ=WEEKLY;INTERVAL=366;COUNT=2",
    "FREQ=DAILY;BYDAY=MO;COUNT=2",
    "FREQ=WEEKLY;BYDAY=MO,MO;COUNT=2",
    "FREQ=WEEKLY;BYDAY=XX;COUNT=2",
    "FREQ=WEEKLY;COUNT=0",
    "FREQ=WEEKLY;COUNT=367",
    "FREQ=WEEKLY;UNKNOWN=X;COUNT=2",
    "FREQ=WEEKLY;FREQ=DAILY;COUNT=2",
    "FREQ=WEEKLY;INTERVAL=2",
    "FREQ=WEEKLY;COUNT=2;UNTIL=20270101T000000Z",
    "FREQ=WEEKLY\n;COUNT=2",
  ])("refuse la RRULE invalide %s", (recurrenceRule) => {
    expect(
      activityDetailPayload(
        detailWith({
          type: "recurring",
          recurrenceRule,
          dates: [occurrence],
          exceptions: [],
        }),
      ),
    ).toBeNull();
  });

  it.each([
    "FREQ=WEEKLY;UNTIL=20200101T000000Z",
    "FREQ=YEARLY;UNTIL=20310901T100001Z",
    "FREQ=YEARLY;UNTIL=20261340T100000Z",
  ])("refuse UNTIL invalide ou hors fenêtre %s", (recurrenceRule) => {
    expect(
      activityDetailPayload(
        detailWith({
          type: "recurring",
          recurrenceRule,
          dates: [occurrence],
          exceptions: [],
        }),
      ),
    ).toBeNull();
  });

  it("refuse les doublons de dates et d'exceptions par instant", () => {
    expect(
      activityDetailPayload(
        detailWith({
          type: "recurring",
          recurrenceRule: "FREQ=WEEKLY;COUNT=2",
          dates: [
            occurrence,
            { ...occurrence, endsAt: "2026-09-01T11:00:00.000Z" },
          ],
          exceptions: [],
        }),
      ),
    ).toBeNull();
    expect(
      activityDetailPayload(
        detailWith({
          type: "recurring",
          recurrenceRule: "FREQ=WEEKLY;COUNT=2",
          dates: [occurrence],
          exceptions: [
            { excludedAt: "2026-09-08T10:00:00.000Z", reason: null },
            { excludedAt: "2026-09-08T12:00:00+02:00", reason: "Même instant" },
          ],
        }),
      ),
    ).toBeNull();
  });
});

describe("contrat précis des années documentaires", () => {
  const document = {
    id: "d",
    slug: "rapport",
    kind: "annual_report",
    title: "Rapport",
    summary: null,
    year: 2025,
    pdf: null,
    publishedAt: "2026-08-05T12:30:00+02:00",
  };

  it("réserve l'année aux rapports annuels et accepte uniquement 1000..9999", () => {
    for (const year of [null, 999, 10_000]) {
      expect(
        documentsPayload({ ...context, documents: [{ ...document, year }] }),
      ).toBeNull();
    }
    expect(
      documentsPayload({
        ...context,
        documents: [{ ...document, year: 1000 }],
      }),
    ).not.toBeNull();
    expect(
      documentsPayload({
        ...context,
        documents: [{ ...document, year: 9999 }],
      }),
    ).not.toBeNull();
    expect(
      documentsPayload({
        ...context,
        documents: [{ ...document, kind: "mission", year: 2025 }],
      }),
    ).toBeNull();
    expect(
      documentsPayload({
        ...context,
        documents: [{ ...document, kind: "mission", year: null }],
      }),
    ).not.toBeNull();
  });
});
