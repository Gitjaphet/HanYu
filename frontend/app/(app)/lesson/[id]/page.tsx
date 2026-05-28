// app/(app)/lesson/[id]/page.tsx
"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MOCK_LESSONS } from "@/lib/constants";
import Link from "next/link";

export default function LessonRouter() {
  const params = useParams();
  const router = useRouter();

  const lesson = MOCK_LESSONS.find(
    (l) => l.id === parseInt(params.id as string, 10)
  );

  useEffect(() => {
    if (!lesson) return;

    // Lit la progression locale pour savoir où reprendre
    const stored = localStorage.getItem(`lesson_progress_${lesson.id}`);
    const progress = stored ? JSON.parse(stored) : null;

    if (!progress || !progress.vocabDone) {
      router.replace(`/lesson/${lesson.id}/vocab`);
    } else if (!progress.dialogueDone) {
      router.replace(`/lesson/${lesson.id}/dialogue`);
    } else if (!progress.quizDone) {
      router.replace(`/lesson/${lesson.id}/quiz`);
    } else {
      // Tout est fait → retour à l'accueil
      router.replace("/");
    }
  }, [lesson, router]);

  // Leçon inconnue
  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-background p-4 text-center">
        <p className="text-text-muted font-bold mb-4">
          Cette leçon n'est pas encore disponible.
        </p>
        <Link
          href="/"
          className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold shadow-md"
        >
          Retour au tableau de bord
        </Link>
      </div>
    );
  }

  // Pendant la redirection
  return (
    <div className="flex items-center justify-center h-[100dvh] bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-text-muted font-bold text-sm">
          Chargement de la leçon…
        </p>
      </div>
    </div>
  );
}