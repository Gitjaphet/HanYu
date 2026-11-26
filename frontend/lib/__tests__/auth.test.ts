import { describe, expect, it } from "vitest";
import { readResetToken, safeNextPath } from "@/lib/auth";

describe("safeNextPath", () => {
  it("garde un chemin interne", () => expect(safeNextPath("/lesson/3")).toBe("/lesson/3"));
  it("renvoie à l'accueil par défaut", () => expect(safeNextPath(null)).toBe("/"));
  it("refuse un site externe", () => expect(safeNextPath("https://pirate.example")).toBe("/"));
  it("refuse une adresse « //site » qui mènerait ailleurs", () => expect(safeNextPath("//pirate.example")).toBe("/"));
});

describe("readResetToken", () => {
  const token = "AbC_dEf-123456789012345678901234567890123";
  it("lit le jeton après le #", () => expect(readResetToken(`#token=${token}`)).toBe(token));
  it("accepte l'adresse sans #", () => expect(readResetToken(`token=${token}`)).toBe(token));
  it("null si absent", () => expect(readResetToken("")).toBeNull());
  it("null si trop court (lien tronqué)", () => expect(readResetToken("#token=abc")).toBeNull());
});
