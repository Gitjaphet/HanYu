import { describe, expect, it } from "vitest";
import { hasHanzi, prepareQuiz, questionHint, questionPrompt, shuffle } from "@/lib/quiz";
import type { QuizQuestion } from "@/types";

/** Suite de nombres « aléatoires » choisie par le test : le résultat est prévisible. */
function sequence(...values: number[]) {
  let i = 0;
  return () => values[i++ % values.length];
}

const question = (id: string, type = "hanzi-to-french"): QuizQuestion => ({
  id, type, hanzi: "你好", pinyin: "nǐ hǎo", french: "Bonjour",
  options: ["Bonjour", "Merci", "Au revoir", "Oui"], answer: "Bonjour",
});

describe("shuffle", () => {
  it("garde exactement les mêmes éléments, sans modifier l'original", () => {
    const original = [1, 2, 3, 4, 5];
    const mixed = shuffle(original);
    expect([...mixed].sort()).toEqual(original);
    expect(original).toEqual([1, 2, 3, 4, 5]);
  });

  it("suit Fisher-Yates", () => {
    // abcd → (i=3, j=0) dbca → (i=2, j=2) dbca → (i=1, j=0) bdca
    expect(shuffle(["a", "b", "c", "d"], sequence(0, 0.99, 0))).toEqual(["b", "d", "c", "a"]);
  });

  it("chaque ordre a la même chance (sans biais)", () => {
    const counts = new Map<string, number>();
    for (let n = 0; n < 60000; n++) {
      const key = shuffle(["a", "b", "c"]).join("");
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    expect(counts.size).toBe(6);
    for (const count of counts.values()) expect(count).toBeGreaterThan(9000); // 10 000 attendus pour chacun
  });
});

describe("prepareQuiz", () => {
  it("mélange les questions et leurs réponses, sans en perdre", () => {
    const prepared = prepareQuiz([question("1"), question("2"), question("3")]);
    expect(prepared.map((q) => q.id).sort()).toEqual(["1", "2", "3"]);
    for (const q of prepared) {
      expect([...q.options].sort()).toEqual(["Au revoir", "Bonjour", "Merci", "Oui"]);
      expect(q.options).toContain(q.answer);
    }
  });
});

describe("textes des questions", () => {
  it("détecte les hanzi", () => {
    expect(hasHanzi("你好")).toBe(true);
    expect(hasHanzi("nǐ hǎo")).toBe(false);
  });

  it("ne donne jamais la réponse dans l'aide", () => {
    expect(questionHint(question("1", "hanzi-to-french"))).toBe("nǐ hǎo");
    expect(questionHint(question("1", "pinyin-to-hanzi"))).toBe("");
    expect(questionHint(question("1", "french-to-hanzi"))).toBe("");
    expect(questionPrompt(question("1", "audio"))).not.toContain("你好");
  });
});
