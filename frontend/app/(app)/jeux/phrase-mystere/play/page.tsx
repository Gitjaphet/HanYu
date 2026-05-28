// src/app/(app)/jeux/phrase-mystere/play/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import PhraseMystere from "@/components/games/PhraseMystere/PhraseMystere";
import { Suspense } from "react";

function PlayPhraseMystereContent() {
  const searchParams = useSearchParams();
  const level = searchParams.get("level") || "A";

  return <PhraseMystere level={level} />;
}

export default function PlayPhraseMysterePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><p className="text-text-muted font-bold">Chargement du jeu...</p></div>}>
      <PlayPhraseMystereContent />
    </Suspense>
  );
}