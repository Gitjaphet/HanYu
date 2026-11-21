// store/progressStore.ts — progression de l'élève, enregistrée dans le navigateur
"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { LessonProgress } from "@/types";
import {
  LEGACY_PREFIX,
  applyQuizResult,
  emptyProgress,
  parseLegacyProgress,
  type ProgressMap,
} from "@/lib/progress";

interface ProgressState {
  progress: ProgressMap;
  hydrated: boolean;
  completeVocab: (lessonId: number) => void;
  completeDialogue: (lessonId: number) => void;
  completeQuiz: (lessonId: number, result: { stars: number; xp: number }) => void;
  resetProgress: () => void;
}

/** Remplace la progression d'une leçon par le résultat de `change`. */
function updateLesson(
  progress: ProgressMap,
  lessonId: number,
  change: (current: LessonProgress) => LessonProgress
): ProgressMap {
  const current = progress[lessonId] ?? emptyProgress(lessonId);
  return { ...progress, [lessonId]: change(current) };
}

/** Une seule fois : récupère les anciennes clés `lesson_progress_<id>`, puis les supprime. */
function importLegacyProgress(): ProgressMap {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(LEGACY_PREFIX));
  const imported = parseLegacyProgress(keys.map((k) => [k, localStorage.getItem(k)]));
  keys.forEach((k) => localStorage.removeItem(k));
  localStorage.removeItem("completedLessons");
  return imported;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      progress: {},
      hydrated: false,

      completeVocab: (lessonId) =>
        set((s) => ({ progress: updateLesson(s.progress, lessonId, (p) => ({ ...p, vocabDone: true })) })),

      completeDialogue: (lessonId) =>
        set((s) => ({ progress: updateLesson(s.progress, lessonId, (p) => ({ ...p, dialogueDone: true })) })),

      completeQuiz: (lessonId, { stars, xp }) =>
        set((s) => ({
          progress: updateLesson(s.progress, lessonId, (p) =>
            applyQuizResult(p, stars, xp, new Date().toISOString())
          ),
        })),

      resetProgress: () => set({ progress: {} }),
    }),
    {
      name: "hanyu-progress",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ progress: state.progress }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        const progress =
          state && Object.keys(state.progress).length > 0 ? state.progress : importLegacyProgress();
        useProgressStore.setState({ progress, hydrated: true });
      },
    }
  )
);
