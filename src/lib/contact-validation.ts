export const contactFields = [
  { name: "name", label: "Votre nom", max: 160 },
  { name: "email", label: "Votre e-mail", max: 320 },
  { name: "phone", label: "Votre téléphone", max: 50, optional: true },
  { name: "subject", label: "Sujet", max: 200 },
  { name: "message", label: "Votre question", max: 5000 },
] as const;

/** Same normalized lengths, email rule and control characters as Hub's contact service. */
export function validateContact(
  values: Record<string, string>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of contactFields) {
    const value = (values[field.name] ?? "").replace(/\r\n?/g, "\n").trim();
    if (!value && !("optional" in field && field.optional))
      errors[field.name] = `${field.label} : renseignez ce champ.`;
    else if (value.length > field.max)
      errors[field.name] = `${field.label} : ${field.max} caractères maximum.`;
    else if (
      [...value].some((c) => c.charCodeAt(0) < 32 && c !== "\n" && c !== "\t")
    )
      errors[field.name] =
        `${field.label} : retirez les caractères non imprimables.`;
  }
  if (
    !errors.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email?.trim() ?? "")
  )
    errors.email =
      "Votre e-mail : indiquez une adresse complète, par exemple prenom@exemple.ch.";
  if (!["general", "paquis", "secheron"].includes(values.recipient))
    errors.recipient = "Destinataire : choisissez une équipe.";
  if (!contactPayloadWithinLimit(buildContactPayload(values)))
    errors.transport =
      "Votre message est trop volumineux pour l’envoi. Raccourcissez votre question, en particulier les symboles et emojis, puis réessayez.";
  return errors;
}
import type {
  ContactRecipient,
  PublicContactSubmission,
} from "./ludohub/types.js";

export const CONTACT_MAX_BODY_BYTES = 16_384;
export const contactPayloadWithinLimit = (payload: unknown) =>
  new TextEncoder().encode(JSON.stringify(payload)).byteLength <=
  CONTACT_MAX_BODY_BYTES;
export function buildContactPayload(
  values: Record<string, string>,
): PublicContactSubmission {
  const clean = (name: string) =>
    (values[name] ?? "").replace(/\r\n?/g, "\n").trim();
  const phone = clean("phone");
  return {
    recipient: clean("recipient") as ContactRecipient,
    name: clean("name"),
    email: clean("email").toLowerCase(),
    ...(phone ? { phone } : {}),
    subject: clean("subject"),
    message: clean("message"),
    website: values.website ?? "",
  };
}
