// src/app/(app)/jeux/hanzi-hunt/play/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import HanziHunt from "@/components/games/HanziHunt/HanziHunt";
import { Suspense } from "react";

function PlayGameContent() {
  const searchParams = useSearchParams();
  const level = searchParams.get("level") || "A";
  const mode = searchParams.get("mode") || "hanzi-fr";

  return <HanziHunt level={level} mode={mode} />;
}

export default function PlayGamePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Chargement du jeu...</div>}>
      <PlayGameContent />
    </Suspense>
  );
}