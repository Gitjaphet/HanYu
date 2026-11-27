// app/(app)/jeux/[game]/play/page.tsx — une partie : charge le contenu du niveau, puis lance le bon jeu
"use client";

import { Suspense, useMemo } from "react";
import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";
import { findGame, parseLevel, parseMode } from "@/lib/games";
import { useLessonsByLevel } from "@/hooks/useLessons";
import { LessonLoading, LessonUnavailable } from "@/components/lesson/LessonState/LessonState";
import { HanziHunt } from "@/components/games/HanziHunt";
import { PhraseMystere } from "@/components/games/PhraseMystere";
import { SpeedTyping } from "@/components/games/SpeedTyping";

function Play() {
  const { game: slug } = useParams<{ game: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const game = findGame(slug);
  const level = parseLevel(search.get("level"));
  const { lessons, loading, error } = useLessonsByLevel(level);

  const words = useMemo(() => lessons.flatMap((l) => l.vocabulaire), [lessons]);
  const lines = useMemo(() => lessons.flatMap((l) => l.dialogue), [lessons]);

  if (!game) notFound();
  if (loading) return <LessonLoading label="Chargement du jeu…" />;
  if (error || lessons.length === 0) {
    return (
      <LessonUnavailable error={error} message={`Pas encore de contenu pour le niveau ${level}.`}
        backHref={`/jeux/${game.slug}`} backLabel="Choisir un autre niveau" />
    );
  }

  const nav = { level, onBack: () => router.push(`/jeux/${game.slug}`), onQuit: () => router.push("/jeux") };
  switch (game.slug) {
    case "hanzi-hunt":
      return <HanziHunt words={words} mode={parseMode(game, search.get("mode"))} {...nav} />;
    case "speed-typing":
      return <SpeedTyping words={words} {...nav} />;
    case "phrase-mystere":
      return <PhraseMystere lines={lines} {...nav} />;
  }
}

export default function PlayPage() {
  return (
    <Suspense fallback={<LessonLoading label="Chargement du jeu…" />}>
      <Play />
    </Suspense>
  );
}
