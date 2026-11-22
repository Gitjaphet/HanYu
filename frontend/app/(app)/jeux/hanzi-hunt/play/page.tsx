// app/(app)/jeux/hanzi-hunt/play/page.tsx
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import HanziHunt from "@/components/games/HanziHunt/HanziHunt";
import { useLessonsByLevel } from "@/hooks/useLessons";
import { LessonLoading, LessonUnavailable } from "@/components/lesson/LessonState/LessonState";

function PlayGameContent() {
  const searchParams = useSearchParams();
  const level = searchParams.get("level") || "A";
  const mode = searchParams.get("mode") || "hanzi-fr";
  const { lessons, loading, error } = useLessonsByLevel(level);

  if (loading) return <LessonLoading label="Chargement du jeu…" />;
  if (error || lessons.length === 0) {
    return (
      <LessonUnavailable
        error={error}
        message={`Pas encore de contenu pour le niveau ${level}.`}
        backHref="/jeux/hanzi-hunt"
        backLabel="Retour au jeu"
      />
    );
  }

  return <HanziHunt level={level} mode={mode} lessons={lessons} />;
}

export default function PlayGamePage() {
  return (
    <Suspense fallback={<LessonLoading label="Chargement du jeu…" />}>
      <PlayGameContent />
    </Suspense>
  );
}
