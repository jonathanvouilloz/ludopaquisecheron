import { describe, expect, it, vi } from "vitest";
import { createContactSession } from "./contact-session.js";
import { buildContactPayload } from "./contact-validation.js";

const draft = {
  name: "Camille Martin",
  email: "camille@example.ch",
  recipient: "general",
  phone: "",
  subject: "Prêt",
  message: "Bonjour",
  website: "",
};

describe("reprise du contact après navigation Astro", () => {
  it("réutilise la clé après acceptation serveur puis réponse client interrompue", async () => {
    const session = createContactSession();
    const generate = vi.fn(() => "first-request-key");
    session.rememberDraft(draft);
    const snapshot = JSON.stringify(buildContactPayload(draft));
    const key = session.keyFor(snapshot, generate);
    let acceptedServerKey: string | null = null;
    const controller = new AbortController();
    // The server accepted the body, but its receipt never reached this client.
    const pendingReceipt = new Promise<void>((_resolve, reject) => {
      acceptedServerKey = key;
      controller.signal.addEventListener(
        "abort",
        () => reject(new DOMException("Page swapped", "AbortError")),
        { once: true },
      );
    });
    controller.abort();
    await expect(pendingReceipt).rejects.toMatchObject({ name: "AbortError" });
    // A new form mount restores this same transient session, not a new request intent.
    const restored = session.state.draft!;
    expect(restored).toEqual(draft);
    expect(session.state.submitted).toBe(false);
    expect(
      session.keyFor(JSON.stringify(buildContactPayload(restored)), generate),
    ).toBe(acceptedServerKey);
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it("maintient la confirmation et protège les brouillons des mutations externes", () => {
    const session = createContactSession();
    const mutable = { ...draft };
    session.rememberDraft(mutable);
    mutable.message = "Modification externe";
    session.state.submitted = true;
    expect(session.state.draft?.message).toBe("Bonjour");
    expect(session.state.submitted).toBe(true);
  });

  it("crée une nouvelle intention explicite, même pour un message identique", () => {
    const session = createContactSession();
    const snapshot = JSON.stringify(buildContactPayload(draft));
    session.rememberDraft(draft);
    session.state.touched.add("name");
    session.state.submitted = true;
    expect(session.keyFor(snapshot, () => "first-request-key")).toBe(
      "first-request-key",
    );
    session.startAnotherMessage();
    expect(session.state.draft).toBeNull();
    expect(session.state.submitted).toBe(false);
    expect(session.state.touched.size).toBe(0);
    expect(session.keyFor(snapshot, () => "second-request-key")).toBe(
      "second-request-key",
    );
  });

  it("retrouve la tentative antérieure après une modification puis un retour au texte initial", () => {
    const session = createContactSession();
    expect(session.keyFor("original", () => "one")).toBe("one");
    expect(session.keyFor("edited", () => "two")).toBe("two");
    expect(session.keyFor("original", () => "three")).toBe("one");
  });
});
