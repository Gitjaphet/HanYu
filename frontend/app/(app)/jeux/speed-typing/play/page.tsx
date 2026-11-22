// app/(app)/jeux/speed-typing/play/page.tsx
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SpeedTyping from "@/components/games/SpeedTyping/SpeedTyping";
import { useLessonsByLevel } from "@/hooks/useLessons";
import { LessonLoading, LessonUnavailable } from "@/components/lesson/LessonState/LessonState";

function PlaySpeedTypingContent() {
  const searchParams = useSearchParams();
  const level = searchParams.get("level") || "A";
  const { lessons, loading, error } = useLessonsByLevel(level);

  if (loading) return <LessonLoading label="Chargement du jeu…" />;
  if (error || lessons.length === 0) {
    return (
      <LessonUnavailable
        error={error}
        message={`Pas encore de contenu pour le niveau ${level}.`}
        backHref="/jeux/speed-typing"
        backLabel="Retour au jeu"
      />
    );
  }

  return <SpeedTyping lessons={lessons} />;
}

export default function PlaySpeedTypingPage() {
  return (
    <Suspense fallback={<LessonLoading label="Chargement du jeu…" />}>
      <PlaySpeedTypingContent />
    </Suspense>
  );
}
