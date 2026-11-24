// lib/stats.ts — chiffres du tableau de bord, calculés depuis la progression (fonctions pures)

import type { CurriculumLevel, Lesson, VocabItem } from "@/types";
import { lessonStatus, type ProgressMap } from "@/lib/progress";

/** Jour local au format AAAA-MM-JJ (le fuseau de l'élève, pas UTC). */
export function localDay(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** XP et étoiles gagnées, nombre de leçons terminées. */
export function totals(progress: ProgressMap) {
  const entries = Object.values(progress);
  return {
    xp: entries.reduce((sum, p) => sum + p.xp, 0),
    stars: entries.reduce((sum, p) => sum + p.stars, 0),
    done: entries.filter((p) => p.quizDone).length,
  };
}

/** Jours (AAAA-MM-JJ) où l'élève a terminé au moins une leçon. */
export function activeDays(progress: ProgressMap): Set<string> {
  const days = new Set<string>();
  for (const p of Object.values(progress)) {
    if (p.completedAt) days.add(localDay(new Date(p.completedAt)));
  }
  return days;
}

/**
 * Série : nombre de jours consécutifs avec une leçon terminée.
 * Elle reste valable jusqu'à la fin de la journée suivante (on compte depuis hier si rien aujourd'hui).
 */
export function streak(days: Set<string>, today: Date): number {
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!days.has(localDay(cursor))) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (days.has(localDay(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export type ReviewWord = VocabItem & { lessonTitle: string };

/** Mots à réviser : le vocabulaire des leçons terminées, les plus récentes d'abord. */
export function reviewWords(lessons: Lesson[], progress: ProgressMap, limit = 3): ReviewWord[] {
  return lessons
    .filter((l) => progress[l.id]?.quizDone)
    .sort((a, b) => (progress[b.id]?.completedAt ?? "").localeCompare(progress[a.id]?.completedAt ?? ""))
    .flatMap((l) => l.vocabulaire.map((word) => ({ ...word, lessonTitle: l.title })))
    .slice(0, limit);
}

export type UnitState = "done" | "current" | "locked";
export type UnitCard = {
  level: string;
  number: number;
  title: string;
  done: number;
  total: number;
  state: UnitState;
};

/** Toutes les unités du cursus avec leur avancement, dans l'ordre. */
export function unitCards(levels: CurriculumLevel[], lessons: Lesson[], progress: ProgressMap): UnitCard[] {
  return levels.flatMap((lv) =>
    lv.units
      .filter((u) => u.lessonIds.length > 0)
      .map((u) => {
        const done = u.lessonIds.filter((id) => progress[id]?.quizDone).length;
        const state: UnitState =
          done === u.lessonIds.length
            ? "done"
            : lessonStatus(lessons, progress, u.lessonIds[0]) === "locked"
              ? "locked"
              : "current";
        return { level: lv.code, number: u.number, title: u.title, done, total: u.lessonIds.length, state };
      })
  );
}

/** Trois unités à montrer : celle en cours, la précédente et la suivante. */
export function unitWindow(cards: UnitCard[], size = 3): UnitCard[] {
  const current = cards.findIndex((c) => c.state === "current");
  const anchor = current === -1 ? Math.max(0, cards.length - size) : current;
  const start = Math.max(0, Math.min(anchor - 1, cards.length - size));
  return cards.slice(start, start + size);
}
