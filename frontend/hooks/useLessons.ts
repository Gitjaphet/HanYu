// hooks/useLessons.ts — les composants lisent le contenu via ces hooks, jamais l'API directement
"use client";

import { useEffect, useMemo, useState } from "react";
import type { CurriculumLevel, Lesson } from "@/types";
import { getCurriculum, getLesson, getLessons } from "@/lib/lessons";

/** Charge une liste une fois au montage : renvoie les données, l'état de chargement et l'erreur. */
function useList<T>(load: () => Promise<T[]>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    load()
      .then((result) => active && setData(result))
      .catch((e: Error) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [load]);

  return { data, loading, error };
}

export function useLessons() {
  const { data, loading, error } = useList<Lesson>(getLessons);
  return { lessons: data, loading, error };
}

export function useCurriculum() {
  return useList<CurriculumLevel>(getCurriculum);
}

type LessonState = { id: number; lesson: Lesson | null; error: string | null };

export function useLesson(id: number) {
  const [state, setState] = useState<LessonState | null>(null);

  useEffect(() => {
    let active = true;
    getLesson(id)
      .then((lesson) => active && setState({ id, lesson, error: null }))
      .catch((e: Error) => active && setState({ id, lesson: null, error: e.message }));
    return () => {
      active = false;
    };
  }, [id]);

  const current = state?.id === id ? state : null;
  return {
    lesson: current?.lesson ?? null,
    loading: current === null,
    error: current?.error ?? null,
  };
}

export function useLessonsByLevel(level: string) {
  const { lessons, loading, error } = useLessons();
  const levelLessons = useMemo(
    () => lessons.filter((l) => l.levelId === level),
    [lessons, level]
  );
  return { lessons: levelLessons, loading, error };
}
