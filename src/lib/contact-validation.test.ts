import { describe, expect, it } from "vitest";
import {
  buildContactPayload,
  contactFields,
  contactPayloadWithinLimit,
  validateContact,
} from "./contact-validation.js";
const values = {
  name: "Camille Martin",
  email: "camille@example.ch",
  phone: "",
  recipient: "general",
  subject: "Prêt",
  message: "Bonjour, avez-vous ce jeu ?",
};
describe("validation du contact avant envoi", () => {
  it("accepte un téléphone vide ou international sans restriction suisse", () => {
    expect(validateContact(values)).toEqual({});
    expect(validateContact({ ...values, phone: "+33 6 00 00 00 00" })).toEqual(
      {},
    );
    expect(validateContact({ ...values, phone: "   " })).toEqual({});
  });
  it("rejette les champs requis blancs et les dépassements serveur", () => {
    for (const field of contactFields) {
      if (!("optional" in field))
        expect(
          validateContact({ ...values, [field.name]: "   " }),
        ).toHaveProperty(field.name);
      expect(
        validateContact({ ...values, [field.name]: "x".repeat(field.max + 1) }),
      ).toHaveProperty(field.name);
    }
  });
  it("explique e-mail, destinataire et contrôles interdits", () => {
    expect(
      validateContact({
        ...values,
        email: "a@localhost",
        recipient: "unknown",
        message: "\u0000Bonjour",
      }),
    ).toEqual({
      email: expect.any(String),
      recipient: expect.any(String),
      message: expect.any(String),
    });
    expect(
      validateContact({ ...values, message: "Bonjour\r\nMerci\t!" }),
    ).toEqual({});
  });

  it("mesure exactement la limite UTF-8 du transport", () => {
    expect(contactPayloadWithinLimit("x".repeat(16_382))).toBe(true);
    expect(contactPayloadWithinLimit("x".repeat(16_383))).toBe(false);
    expect(contactPayloadWithinLimit("遊".repeat(5_461))).toBe(false);
  });

  it("rejette une demande multioctet pourtant valide champ par champ", () => {
    const large = {
      ...values,
      name: "遊".repeat(160),
      subject: "遊".repeat(200),
      phone: "遊".repeat(50),
      email: `${"a".repeat(300)}@example.ch`,
      message: "遊".repeat(5000),
    };
    expect(validateContact(large)).toEqual({ transport: expect.any(String) });
    expect(contactPayloadWithinLimit(buildContactPayload(large))).toBe(false);
    expect(validateContact({ ...large, message: "遊".repeat(4000) })).toEqual(
      {},
    );
  });

  it("normalise exactement le corps qui sera mesuré et envoyé", () => {
    expect(
      buildContactPayload({
        ...values,
        name: " Camille ",
        email: " CAMILLE@EXAMPLE.CH ",
        phone: " ",
        message: " Bonjour\r\nMerci ",
      }),
    ).toEqual({
      name: "Camille",
      email: "camille@example.ch",
      recipient: "general",
      subject: "Prêt",
      message: "Bonjour\nMerci",
      website: "",
    });
  });
});
