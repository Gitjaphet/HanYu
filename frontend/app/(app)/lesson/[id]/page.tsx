// app/(app)/lesson/[id]/page.tsx — aiguille l'élève vers la partie à reprendre
"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLesson } from "@/hooks/useLessons";
import { LessonLoading, LessonUnavailable } from "@/components/lesson/LessonState/LessonState";

export default function LessonRouter() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { lesson, loading, error } = useLesson(Number(params.id));

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

  if (!loading && !lesson) return <LessonUnavailable error={error} />;

  // Chargement, puis redirection
  return <LessonLoading />;
}
