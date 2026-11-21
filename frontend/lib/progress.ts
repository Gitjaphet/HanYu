// lib/progress.ts — règles de progression (pures : pas de React, pas de localStorage)

import type { Lesson, LessonProgress } from "@/types";

export type ProgressMap = Record<number, LessonProgress>;
export type LessonStep = "vocab" | "dialogue" | "quiz";

export function emptyProgress(lessonId: number): LessonProgress {
  return { lessonId, vocabDone: false, dialogueDone: false, quizDone: false, stars: 0, xp: 0 };
}

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
export function lessonStatus(lessons: Lesson[], progress: ProgressMap, lessonId: number): Lesson["status"] {
  const p = progress[lessonId];
  if (p?.quizDone) return "completed";

  const index = lessons.findIndex((l) => l.id === lessonId);
  if (index === -1) return "locked";

  const previous = lessons[index - 1];
  const unlocked = index === 0 || Boolean(previous && progress[previous.id]?.quizDone);
  if (!unlocked) return "locked";

  return p?.vocabDone || p?.dialogueDone ? "in-progress" : "available";
}
