// lib/lessons.ts — le contenu vient de l'API FastAPI (source unique : backend/app/seed/lessons.json)

import type { CurriculumLevel, Lesson } from "@/types";
import { ApiError, apiFetch } from "@/lib/api";

export function getLessons(): Promise<Lesson[]> {
  return apiFetch<Lesson[]>("/lessons");
}

export async function getLesson(id: number): Promise<Lesson | null> {
  try {
    return await apiFetch<Lesson>(`/lessons/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export function getCurriculum(): Promise<CurriculumLevel[]> {
  return apiFetch<CurriculumLevel[]>("/curriculum");
}
