// lib/progress.ts — règles de progression (pures : pas de React, pas de localStorage)

import type { Lesson, LessonProgress, LessonStatus } from "@/types";

export type ProgressMap = Record<number, LessonProgress>;
export type LessonStep = "vocab" | "dialogue" | "quiz";

export function emptyProgress(lessonId: number): LessonProgress {
  return { lessonId, vocabDone: false, dialogueDone: false, quizDone: false, stars: 0, xp: 0 };
}

/** Règles du quiz, identiques au serveur (backend/app/services/progress.py). */
export const XP_PER_CORRECT = 10;
export const HEARTS = 3; // erreurs permises avant l'échec

/** Étoiles du quiz : 3 = sans faute, 2 = au moins 70 %, 1 = réussi, 0 = échoué. */
export function quizStars(score: number, total: number, failed: boolean): number {
  if (failed || total === 0) return 0;
  if (score === total) return 3;
  if (score >= total * 0.7) return 2;
  return 1;
}

/** Prochaine partie à faire dans une leçon, ou null si tout est terminé. */
export function nextStep(progress: LessonProgress | undefined): LessonStep | null {
  if (!progress?.vocabDone) return "vocab";
  if (!progress.dialogueDone) return "dialogue";
  if (!progress.quizDone) return "quiz";
  return null;
}

/**
 * Statut d'une leçon dans le cursus. `lessons` doit être dans l'ordre du cursus :
 * une leçon se déverrouille quand la précédente (même dans une autre unité) est terminée.
 */
export function lessonStatus(lessons: Lesson[], progress: ProgressMap, lessonId: number): LessonStatus {
  const p = progress[lessonId];
  if (p?.quizDone) return "completed";

  const index = lessons.findIndex((l) => l.id === lessonId);
  if (index === -1) return "locked";

  const previous = lessons[index - 1];
  const unlocked = index === 0 || Boolean(previous && progress[previous.id]?.quizDone);
  if (!unlocked) return "locked";

  return p?.vocabDone || p?.dialogueDone ? "in-progress" : "available";
}

/** Résultat d'un quiz : un quiz raté (0 étoile) ne change rien, sinon on garde le meilleur score. */
export function applyQuizResult(current: LessonProgress, stars: number, xp: number, now: string): LessonProgress {
  if (stars === 0) return current;
  return {
    ...current,
    quizDone: true,
    stars: Math.max(current.stars, stars),
    xp: Math.max(current.xp, xp),
    completedAt: current.completedAt ?? now,
  };
}

export const LEGACY_PREFIX = "lesson_progress_";

/** Reprend les anciennes clés localStorage `lesson_progress_<id>` (avant le store Zustand). */
export function parseLegacyProgress(entries: Array<[string, string | null]>): ProgressMap {
  const result: ProgressMap = {};
  for (const [key, raw] of entries) {
    if (!key.startsWith(LEGACY_PREFIX) || !raw) continue;
    const lessonId = Number(key.slice(LEGACY_PREFIX.length));
    if (!Number.isInteger(lessonId) || lessonId <= 0) continue;
    try {
      const old = JSON.parse(raw);
      result[lessonId] = {
        ...emptyProgress(lessonId),
        vocabDone: Boolean(old.vocabDone),
        dialogueDone: Boolean(old.dialogueDone),
        quizDone: Boolean(old.quizDone),
        stars: Number(old.stars) || 0,
        xp: Number(old.xp) || 0,
      };
    } catch {
      // entrée corrompue : ignorée
    }
  }
  return result;
}

/** Nombre de leçons terminées sur un ensemble de leçons. */
export function countDone(lessons: Lesson[], progress: ProgressMap): number {
  return lessons.filter((l) => progress[l.id]?.quizDone).length;
}

/**
 * Leçon à reprendre : la première, dans l'ordre du cursus, qui est commencée
 * ou disponible. null si tout est terminé (ou rien n'est chargé).
 */
export function nextLesson(lessons: Lesson[], progress: ProgressMap): Lesson | null {
  return (
    lessons.find((l) => {
      const status = lessonStatus(lessons, progress, l.id);
      return status === "in-progress" || status === "available";
    }) ?? null
  );
}

/** Étoiles et XP d'un quiz à partir des réponses comptées (même calcul que le serveur). */
export function quizResult(correct: number, wrong: number, total: number): { stars: number; xp: number } {
  return { stars: quizStars(correct, total, wrong >= HEARTS), xp: correct * XP_PER_CORRECT };
}

/**
 * Progression locale à envoyer au serveur quand un compte se connecte :
 * celle d'un invité (ownerId null) ou du même compte (rattrapage hors ligne),
 * jamais celle d'un autre compte (ordinateur partagé).
 */
export function progressToImport(progress: ProgressMap, ownerId: number | null, userId: number): LessonProgress[] {
  if (ownerId !== null && ownerId !== userId) return [];
  return Object.values(progress).filter((p) => p.vocabDone || p.dialogueDone || p.quizDone);
}
