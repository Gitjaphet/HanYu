// lib/lessons.ts — d'où viennent les leçons : données en dur ou API FastAPI

import type { Lesson } from "@/types";
import { ApiError, apiFetch } from "@/lib/api";
import { MOCK_LESSONS } from "@/lib/constants";

const USE_API = process.env.NEXT_PUBLIC_DATA_SOURCE === "api";

export async function getLessons(): Promise<Lesson[]> {
  if (USE_API) return apiFetch<Lesson[]>("/lessons");
  return MOCK_LESSONS;
}

export async function getLesson(id: number): Promise<Lesson | null> {
  if (!USE_API) return MOCK_LESSONS.find((l) => l.id === id) ?? null;

  try {
    return await apiFetch<Lesson>(`/lessons/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
