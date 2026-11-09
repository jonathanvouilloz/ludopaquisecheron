import { buildContactPayload, validateContact } from "./contact-validation.js";
import { createContactSession } from "./contact-session.js";

const contactSession = createContactSession();

export function initializeContactForm() {
  const form = document.querySelector<HTMLFormElement>("[data-contact-form]");
  if (!form || form.dataset.contactInitialized) return;
  form.dataset.contactInitialized = "true";
  const status = document.querySelector<HTMLElement>(
    "[data-contact-status] span",
  );
  const submitButton = form.querySelector<HTMLButtonElement>(
    'button[type="submit"]',
  )!;
  const controls = form.querySelector<HTMLFieldSetElement>("fieldset")!;
  const summary = form.querySelector<HTMLElement>(
    "[data-contact-requirements]",
  )!;
  const another = form.querySelector<HTMLButtonElement>(
    "[data-contact-another]",
  )!;
  const lifecycle = new AbortController();
  const { state } = contactSession;
  const touched = state.touched;
  let sending = false;
  if (state.draft) {
    for (const field of form.querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >("[name]")) {
      if (field.name in state.draft) field.value = state.draft[field.name];
    }
  }
  controls.disabled = state.submitted;
  another.hidden = !state.submitted;
  const setStatus = (message: string) => {
    if (status) status.textContent = message;
  };
  if (state.submitted)
    setStatus(
      "Votre message a été reçu. Vous n’avez pas besoin de le renvoyer.",
    );
  const values = () =>
    Object.fromEntries(
      [
        ...form.querySelectorAll<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >("[name]"),
      ].map((field) => [field.name, field.value]),
    );
  const render = () => {
    const errors = validateContact(values());
    for (const field of form.querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >("[data-validate]")) {
      field.setAttribute(
        "aria-invalid",
        String(touched.has(field.name) && Boolean(errors[field.name])),
      );
      const error = form.querySelector<HTMLElement>(
        `#contact-${field.name}-error`,
      );
      if (error)
        error.textContent = touched.has(field.name)
          ? (errors[field.name] ?? "")
          : "";
    }
    summary.replaceChildren();
    const heading = document.createElement("p");
    heading.textContent = state.submitted
      ? "Votre message a été reçu. Vous n’avez pas besoin de le renvoyer."
      : Object.keys(errors).length
        ? "Pour envoyer votre message, complétez les points suivants :"
        : "Tous les champs sont valides. Vous pouvez envoyer votre message.";
    summary.append(heading);
    if (!state.submitted && Object.keys(errors).length) {
      const list = document.createElement("ul");
      for (const message of Object.values(errors)) {
        const item = document.createElement("li");
        item.textContent = message;
        list.append(item);
      }
      summary.append(list);
    }
    submitButton.disabled =
      !form.dataset.contactEndpoint ||
      sending ||
      state.submitted ||
      Object.keys(errors).length > 0;
    return errors;
  };
  const interact = (event: Event) => {
    const target = event.target;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLSelectElement ||
      target instanceof HTMLTextAreaElement
    )
      touched.add(target.name);
    contactSession.rememberDraft(values());
    render();
  };
  form.addEventListener("input", interact, { signal: lifecycle.signal });
  form.addEventListener("focusout", interact, { signal: lifecycle.signal });
  form.addEventListener("change", interact, { signal: lifecycle.signal });
  another.addEventListener(
    "click",
    () => {
      form.reset();
      contactSession.startAnotherMessage();
      controls.disabled = false;
      another.hidden = true;
      setStatus("Vous pouvez préparer un autre message.");
      render();
      form.querySelector<HTMLInputElement>("#contact-name")?.focus();
    },
    { signal: lifecycle.signal },
  );
  form.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();
      if (sending || state.submitted) return;
      const endpoint = form.dataset.contactEndpoint;
      if (!endpoint) {
        setStatus(
          "Le formulaire est indisponible. Utilisez l’e-mail ou le téléphone.",
        );
        return;
      }
      const errors = render();
      if (Object.keys(errors).length) {
        Object.keys(errors).forEach((name) => touched.add(name));
        render();
        form
          .querySelector<HTMLElement>(
            `#contact-${Object.keys(errors)[0] === "transport" ? "message" : Object.keys(errors)[0]}`,
          )
          ?.focus();
        return;
      }
      if (!globalThis.crypto?.randomUUID) {
        setStatus(
          "Votre navigateur ne permet pas un envoi sécurisé. Utilisez l’e-mail ou le téléphone.",
        );
        return;
      }
      const raw = values();
      contactSession.rememberDraft(raw);
      const payload = buildContactPayload(raw);
      const snapshot = JSON.stringify(payload);
      const idempotencyKey = contactSession.keyFor(snapshot);
      sending = true;
      controls.disabled = true;
      submitButton.disabled = true;
      form.setAttribute("aria-busy", "true");
      setStatus("Envoi en cours…");
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Idempotency-Key": idempotencyKey,
          },
          body: snapshot,
          signal: lifecycle.signal,
        });
        const receipt: unknown = await response.json().catch(() => null);
        const accepted =
          typeof receipt === "object" &&
          receipt !== null &&
          "accepted" in receipt &&
          receipt.accepted === true &&
          "receiptId" in receipt &&
          typeof receipt.receiptId === "string" &&
          receipt.receiptId.trim().length > 0;
        if ((response.status === 200 || response.status === 201) && accepted) {
          state.submitted = true;
          another.hidden = false;
          setStatus(
            "Message envoyé. Merci, l’équipe vous répondra dès que possible.",
          );
        } else if (response.status === 400)
          setStatus(
            "Certains champs sont invalides. Vos informations ont été conservées : vérifiez-les puis réessayez.",
          );
        else if (response.status === 413)
          setStatus(
            "Votre message est trop volumineux. Raccourcissez votre question, en particulier les symboles et emojis, puis réessayez. Vos informations ont été conservées.",
          );
        else if (response.status === 429)
          setStatus(
            "Trop de tentatives ont été envoyées. Patientez avant de réessayer ou utilisez l’e-mail.",
          );
        else
          setStatus(
            "Le service d’envoi est indisponible. Votre message a été conservé : réessayez ou utilisez l’e-mail ou le téléphone.",
          );
      } catch {
        if (!lifecycle.signal.aborted)
          setStatus(
            "L’envoi n’a pas pu être confirmé. Votre message a été conservé : vérifiez votre connexion puis réessayez.",
          );
      } finally {
        sending = false;
        controls.disabled = state.submitted;
        form.removeAttribute("aria-busy");
        render();
      }
    },
    { signal: lifecycle.signal },
  );
  document.addEventListener(
    "astro:before-swap",
    () => {
      contactSession.rememberDraft(values());
      lifecycle.abort();
    },
    { once: true, signal: lifecycle.signal },
  );
  render();
}
