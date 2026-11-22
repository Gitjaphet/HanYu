import { describe, expect, it } from "vitest";
import { applyQuizResult, emptyProgress, parseLegacyProgress } from "@/lib/progress";

const NOW = "2026-11-21T18:00:00.000Z";

describe("applyQuizResult", () => {
  it("valide la leçon quand le quiz est réussi", () => {
    const result = applyQuizResult(emptyProgress(1), 2, 40, NOW);
    expect(result).toMatchObject({ quizDone: true, stars: 2, xp: 40, completedAt: NOW });
  });

  it("ne valide rien quand le quiz est raté", () => {
    const before = emptyProgress(1);
    expect(applyQuizResult(before, 0, 20, NOW)).toEqual(before);
  });

  it("garde le meilleur score et la première date de réussite", () => {
    const first = applyQuizResult(emptyProgress(1), 3, 50, NOW);
    const retry = applyQuizResult(first, 1, 10, "2026-12-01T00:00:00.000Z");
    expect(retry).toMatchObject({ stars: 3, xp: 50, completedAt: NOW });
  });
});

describe("parseLegacyProgress", () => {
  it("reprend les anciennes clés lesson_progress_<id>", () => {
    const result = parseLegacyProgress([
      ["lesson_progress_1", JSON.stringify({ vocabDone: true, dialogueDone: true, quizDone: true, stars: 3, xp: 60 })],
      ["lesson_progress_2", JSON.stringify({ vocabDone: true })],
    ]);
    expect(result[1]).toMatchObject({ quizDone: true, stars: 3, xp: 60 });
    expect(result[2]).toMatchObject({ vocabDone: true, dialogueDone: false, quizDone: false });
  });

  it("ignore les autres clés et les valeurs corrompues", () => {
    const result = parseLegacyProgress([
      ["theme", "dark"],
      ["lesson_progress_3", "{pas du json"],
      ["lesson_progress_abc", "{}"],
    ]);
    expect(result).toEqual({});
  });
});
