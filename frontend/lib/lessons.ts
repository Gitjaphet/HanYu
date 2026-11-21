// lib/lessons.ts — le contenu vient de l'API FastAPI (source unique : backend/app/seed/lessons.json)

import type { CurriculumLevel, Lesson } from "@/types";
import { ApiError, apiFetch, sharedRequest } from "@/lib/api";

export const getLessons = sharedRequest(() => apiFetch<Lesson[]>("/lessons"));

export const getCurriculum = sharedRequest(() => apiFetch<CurriculumLevel[]>("/curriculum"));

export async function getLesson(id: number): Promise<Lesson | null> {
  try {
    return await apiFetch<Lesson>(`/lessons/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
