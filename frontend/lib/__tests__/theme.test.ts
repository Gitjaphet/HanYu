import { describe, expect, it } from "vitest";
import { resolveTheme } from "../theme";

describe("resolveTheme", () => {
  it("respecte le choix enregistré", () => {
    expect(resolveTheme("dark", false)).toBe("dark");
    expect(resolveTheme("light", true)).toBe("light");
  });

  it("suit le système sans choix enregistré", () => {
    expect(resolveTheme(null, true)).toBe("dark");
    expect(resolveTheme(null, false)).toBe("light");
  });

  it("ignore une valeur invalide", () => {
    expect(resolveTheme("violet", true)).toBe("dark");
  });
});
