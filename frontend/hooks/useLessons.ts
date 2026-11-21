// hooks/useLessons.ts — les composants lisent les leçons via ces hooks, jamais MOCK_LESSONS
"use client";

import { useEffect, useMemo, useState } from "react";
import type { Lesson } from "@/types";
import { getLesson, getLessons } from "@/lib/lessons";

export function useLessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getLessons()
      .then((data) => active && setLessons(data))
      .catch((e: Error) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { lessons, loading, error };
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
