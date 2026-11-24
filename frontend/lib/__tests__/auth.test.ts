import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/lib/auth";

describe("safeNextPath", () => {
  it("garde un chemin interne", () => expect(safeNextPath("/lesson/3")).toBe("/lesson/3"));
  it("renvoie à l'accueil par défaut", () => expect(safeNextPath(null)).toBe("/"));
  it("refuse un site externe", () => expect(safeNextPath("https://pirate.example")).toBe("/"));
  it("refuse une adresse « //site » qui mènerait ailleurs", () => expect(safeNextPath("//pirate.example")).toBe("/"));
});
