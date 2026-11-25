// lib/progressApi.ts — progression de l'élève connecté, enregistrée sur le serveur

import type { LessonProgress } from "@/types";
import { apiFetch } from "@/lib/api";
import type { ProgressMap } from "@/lib/progress";

/** Format renvoyé par l'API (completedAt vaut null tant que le quiz n'est pas réussi). */
type ApiProgress = Omit<LessonProgress, "completedAt"> & { completedAt: string | null };

export function fromApi(row: ApiProgress): LessonProgress {
  const { completedAt, ...rest } = row;
  return completedAt ? { ...rest, completedAt } : rest;
}

export function toProgressMap(rows: ApiProgress[]): ProgressMap {
  return Object.fromEntries(rows.map((row) => [row.lessonId, fromApi(row)]));
}

export async function fetchProgress(): Promise<ProgressMap> {
  return toProgressMap(await apiFetch<ApiProgress[]>("/progress"));
}

export async function saveStep(lessonId: number, step: "vocab" | "dialogue"): Promise<LessonProgress> {
  return fromApi(await apiFetch<ApiProgress>(`/progress/${lessonId}/${step}`, { method: "POST" }));
}

export async function saveQuiz(lessonId: number, result: { correct: number; wrong: number }): Promise<LessonProgress> {
  return fromApi(
    await apiFetch<ApiProgress>(`/progress/${lessonId}/quiz`, { method: "POST", body: JSON.stringify(result) })
  );
}

/** Fusionne une progression locale dans le compte ; renvoie la progression complète du compte. */
export async function importProgress(items: LessonProgress[]): Promise<ProgressMap> {
  return toProgressMap(
    await apiFetch<ApiProgress[]>("/progress/import", { method: "POST", body: JSON.stringify({ items }) })
  );
}
