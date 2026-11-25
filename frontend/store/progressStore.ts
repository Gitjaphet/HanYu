// store/progressStore.ts — progression de l'élève.
// Toujours gardée dans le navigateur (affichage immédiat, mode invité, coupure réseau) ;
// pour un élève connecté, le serveur fait foi : ses réponses remplacent la copie locale.
"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { LessonProgress } from "@/types";
import {
  LEGACY_PREFIX,
  applyQuizResult,
  emptyProgress,
  parseLegacyProgress,
  progressToImport,
  quizResult,
  type ProgressMap,
} from "@/lib/progress";
import * as api from "@/lib/progressApi";

type QuizAnswers = { correct: number; wrong: number; total: number };

interface ProgressState {
  progress: ProgressMap;
  /** Compte auquel appartient la copie locale (null = invité). */
  ownerId: number | null;
  hydrated: boolean;
  completeVocab: (lessonId: number) => void;
  completeDialogue: (lessonId: number) => void;
  completeQuiz: (lessonId: number, answers: QuizAnswers) => void;
  /** À la connexion : envoie la progression locale au compte, puis reprend celle du serveur. */
  syncWithAccount: (userId: number) => Promise<void>;
  /** À la déconnexion : la copie locale du compte est effacée. */
  leaveAccount: () => void;
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
    (set, get) => {
      /**
       * Connecté : envoie l'étape au serveur et garde sa réponse (étoiles et XP calculés par lui).
       * En cas d'échec (réseau, session expirée), la copie locale reste : elle sera
       * renvoyée à la prochaine connexion via syncWithAccount.
       */
      const sendToServer = (lessonId: number, request: () => Promise<LessonProgress>) => {
        if (get().ownerId === null) return;
        request()
          .then((saved) => set((s) => ({ progress: { ...s.progress, [lessonId]: saved } })))
          .catch(() => {});
      };

      return {
        progress: {},
        ownerId: null,
        hydrated: false,

        completeVocab: (lessonId) => {
          set((s) => ({ progress: updateLesson(s.progress, lessonId, (p) => ({ ...p, vocabDone: true })) }));
          sendToServer(lessonId, () => api.saveStep(lessonId, "vocab"));
        },

        completeDialogue: (lessonId) => {
          set((s) => ({ progress: updateLesson(s.progress, lessonId, (p) => ({ ...p, dialogueDone: true })) }));
          sendToServer(lessonId, () => api.saveStep(lessonId, "dialogue"));
        },

        completeQuiz: (lessonId, { correct, wrong, total }) => {
          const { stars, xp } = quizResult(correct, wrong, total);
          set((s) => ({
            progress: updateLesson(s.progress, lessonId, (p) =>
              applyQuizResult(p, stars, xp, new Date().toISOString())
            ),
          }));
          sendToServer(lessonId, () => api.saveQuiz(lessonId, { correct, wrong }));
        },

        syncWithAccount: async (userId) => {
          // La copie locale doit être chargée avant d'être envoyée (pages /login, /register…)
          if (!get().hydrated) await useProgressStore.persist.rehydrate();
          const { progress, ownerId } = get();
          const local = progressToImport(progress, ownerId, userId);
          try {
            const server = local.length > 0 ? await api.importProgress(local) : await api.fetchProgress();
            set({ progress: server, ownerId: userId });
          } catch {
            // API injoignable : on garde la copie locale, la synchronisation sera retentée
          }
        },

        leaveAccount: () => set({ progress: {}, ownerId: null }),
      };
    },
    {
      name: "hanyu-progress",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ progress: state.progress, ownerId: state.ownerId }),
      // v1 → v2 : la copie locale n'avait pas de propriétaire, elle devient celle d'un invité
      migrate: (persisted, version) => {
        const state = persisted as { progress?: ProgressMap; ownerId?: number | null };
        return version < 2 ? { progress: state.progress ?? {}, ownerId: null } : state;
      },
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        const progress =
          state && Object.keys(state.progress).length > 0 ? state.progress : importLegacyProgress();
        useProgressStore.setState({ progress, hydrated: true });
      },
    }
  )
);
