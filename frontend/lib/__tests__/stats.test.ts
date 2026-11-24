import { describe, expect, it } from "vitest";
import type { CurriculumLevel, Lesson } from "@/types";
import { emptyProgress, type ProgressMap } from "@/lib/progress";
import { activeDays, localDay, reviewWords, streak, totals, unitCards, unitWindow } from "@/lib/stats";

const finished = (id: number, completedAt: string, stars = 3) => ({
  ...emptyProgress(id), vocabDone: true, dialogueDone: true, quizDone: true, stars, xp: 10 * stars, completedAt,
});

describe("totals", () => {
  it("additionne XP et étoiles, compte les leçons terminées", () => {
    const progress: ProgressMap = { 1: finished(1, "2026-11-20T10:00:00", 3), 2: { ...emptyProgress(2), vocabDone: true } };
    expect(totals(progress)).toEqual({ xp: 30, stars: 3, done: 1 });
  });
});

describe("streak", () => {
  const today = new Date(2026, 10, 22, 15, 0); // 22 novembre 2026

  it("compte les jours consécutifs jusqu'à aujourd'hui", () => {
    expect(streak(new Set(["2026-11-20", "2026-11-21", "2026-11-22"]), today)).toBe(3);
  });

  it("reste valable si la dernière leçon date d'hier", () => {
    expect(streak(new Set(["2026-11-20", "2026-11-21"]), today)).toBe(2);
  });

  it("retombe à 0 après un jour sans leçon", () => {
    expect(streak(new Set(["2026-11-19", "2026-11-20"]), today)).toBe(0);
  });
});

describe("activeDays", () => {
  it("donne le jour local de chaque leçon terminée", () => {
    const at = new Date(2026, 10, 21, 9, 30);
    expect(activeDays({ 1: finished(1, at.toISOString()) })).toEqual(new Set([localDay(at)]));
  });
});

const lessons = [
  { id: 1, title: "Salutations", vocabulaire: [{ id: "a", hanzi: "你好", pinyin: "nǐ hǎo", french: "Bonjour" }] },
  { id: 2, title: "Politesse", vocabulaire: [{ id: "b", hanzi: "谢谢", pinyin: "xiè xie", french: "Merci" }] },
  { id: 3, title: "Les Chiffres", vocabulaire: [] },
] as unknown as Lesson[];

describe("reviewWords", () => {
  it("prend le vocabulaire des leçons terminées, les plus récentes d'abord", () => {
    const progress: ProgressMap = { 1: finished(1, "2026-11-20T10:00:00"), 2: finished(2, "2026-11-21T10:00:00") };
    expect(reviewWords(lessons, progress).map((w) => w.hanzi)).toEqual(["谢谢", "你好"]);
  });
});

describe("unitCards / unitWindow", () => {
  const levels = [
    { code: "A", label: "", subtitle: "", tag: "", units: [
      { number: 1, title: "Les bases", lessonIds: [1, 2] },
      { number: 2, title: "Se présenter", lessonIds: [3] },
    ] },
  ] as CurriculumLevel[];

  it("marque l'unité terminée, en cours ou verrouillée", () => {
    const progress: ProgressMap = { 1: finished(1, "2026-11-20T10:00:00") };
    expect(unitCards(levels, lessons, progress).map((c) => c.state)).toEqual(["current", "locked"]);
  });

  it("centre la fenêtre sur l'unité en cours", () => {
    const cards = ["done", "done", "current", "locked", "locked"].map((state, i) => ({
      level: "A", number: i + 1, title: "", done: 0, total: 1, state: state as "done" | "current" | "locked",
    }));
    expect(unitWindow(cards).map((c) => c.number)).toEqual([2, 3, 4]);
  });
});
