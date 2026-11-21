// app/(app)/lesson/[id]/page.tsx — aiguille l'élève vers la partie à reprendre
"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLesson } from "@/hooks/useLessons";
import { useProgressStore } from "@/store/progressStore";
import { nextStep } from "@/lib/progress";
import { LessonLoading, LessonUnavailable } from "@/components/lesson/LessonState/LessonState";

export default function LessonRouter() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { lesson, loading, error } = useLesson(Number(params.id));
  const hydrated = useProgressStore((s) => s.hydrated);
  const progress = useProgressStore((s) => (lesson ? s.progress[lesson.id] : undefined));

  useEffect(() => {
    // On attend la leçon ET la progression enregistrée, sinon on renverrait au vocabulaire à tort
    if (!lesson || !hydrated) return;

    // Leçon terminée → « Réviser » la reprend depuis le vocabulaire
    const step = nextStep(progress) ?? "vocab";
    router.replace(`/lesson/${lesson.id}/${step}`);
  }, [lesson, hydrated, progress, router]);

  if (!loading && !lesson) return <LessonUnavailable error={error} />;

  // Chargement, puis redirection
  return <LessonLoading />;
}
