import { describe, expect, it } from "vitest";
import type { Lesson } from "@/types";
import { countDone, emptyProgress, nextLesson, type ProgressMap } from "@/lib/progress";

const lessons = [{ id: 1 }, { id: 2 }, { id: 3 }] as Lesson[];
const done = (id: number) => ({ ...emptyProgress(id), vocabDone: true, dialogueDone: true, quizDone: true, stars: 3 });

describe("countDone", () => {
  it("compte les leçons dont le quiz est validé", () => {
    const progress: ProgressMap = { 1: done(1), 2: { ...emptyProgress(2), vocabDone: true } };
    expect(countDone(lessons, progress)).toBe(1);
  });
});

describe("nextLesson", () => {
  it("propose la première leçon au départ", () => {
    expect(nextLesson(lessons, {})?.id).toBe(1);
  });

  it("propose la leçon suivante après une leçon terminée", () => {
    expect(nextLesson(lessons, { 1: done(1) })?.id).toBe(2);
  });

  it("renvoie null quand tout est terminé", () => {
    expect(nextLesson(lessons, { 1: done(1), 2: done(2), 3: done(3) })).toBeNull();
  });
});
