import { describe, expect, it } from "vitest";
import type { Lesson } from "@/types";
import { emptyProgress, lessonStatus, nextStep, quizStars, type ProgressMap } from "@/lib/progress";

// Trois leçons minimales, dans l'ordre du cursus (la 3 est dans une autre unité)
const lessons = [
  { id: 1, unitId: 1 },
  { id: 2, unitId: 1 },
  { id: 3, unitId: 2 },
] as Lesson[];

const done = (lessonId: number) => ({ ...emptyProgress(lessonId), vocabDone: true, dialogueDone: true, quizDone: true, stars: 2 });

describe("quizStars", () => {
  it("donne 3 étoiles sans faute", () => expect(quizStars(5, 5, false)).toBe(3));
  it("donne 2 étoiles à partir de 70 %", () => expect(quizStars(7, 10, false)).toBe(2));
  it("donne 1 étoile en dessous de 70 %", () => expect(quizStars(3, 10, false)).toBe(1));
  it("donne 0 étoile si l'élève a perdu tous ses cœurs", () => expect(quizStars(4, 5, true)).toBe(0));
});

describe("nextStep", () => {
  it("commence par le vocabulaire", () => expect(nextStep(undefined)).toBe("vocab"));
  it("enchaîne sur le dialogue", () => expect(nextStep({ ...emptyProgress(1), vocabDone: true })).toBe("dialogue"));
  it("renvoie null quand tout est fait", () => expect(nextStep(done(1))).toBeNull());
});

describe("lessonStatus", () => {
  it("ouvre la première leçon et verrouille les suivantes", () => {
    expect(lessonStatus(lessons, {}, 1)).toBe("available");
    expect(lessonStatus(lessons, {}, 2)).toBe("locked");
  });

  it("déverrouille la leçon suivante, même dans une autre unité", () => {
    const progress: ProgressMap = { 1: done(1), 2: done(2) };
    expect(lessonStatus(lessons, progress, 3)).toBe("available");
  });

  it("marque une leçon commencée comme en cours", () => {
    const progress: ProgressMap = { 1: { ...emptyProgress(1), vocabDone: true } };
    expect(lessonStatus(lessons, progress, 1)).toBe("in-progress");
  });

  it("ne déverrouille pas après un quiz seulement commencé", () => {
    const progress: ProgressMap = { 1: { ...emptyProgress(1), vocabDone: true, dialogueDone: true } };
    expect(lessonStatus(lessons, progress, 2)).toBe("locked");
  });
});
