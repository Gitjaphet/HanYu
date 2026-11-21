// app/(app)/jeux/phrase-mystere/play/page.tsx
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PhraseMystere from "@/components/games/PhraseMystere/PhraseMystere";
import { useLessonsByLevel } from "@/hooks/useLessons";
import { LessonLoading, LessonUnavailable } from "@/components/lesson/LessonState/LessonState";

function PlayPhraseMystereContent() {
  const searchParams = useSearchParams();
  const level = searchParams.get("level") || "A";
  const { lessons, loading, error } = useLessonsByLevel(level);

  if (loading) return <LessonLoading label="Chargement du jeu…" />;
  if (error || lessons.length === 0) {
    return (
      <LessonUnavailable
        error={error}
        message={`Pas encore de contenu pour le niveau ${level}.`}
        backHref="/jeux/phrase-mystere"
        backLabel="Retour au jeu"
      />
    );
  }

  return <PhraseMystere lessons={lessons} />;
}

export default function PlayPhraseMysterePage() {
  return (
    <Suspense fallback={<LessonLoading label="Chargement du jeu…" />}>
      <PlayPhraseMystereContent />
    </Suspense>
  );
}
