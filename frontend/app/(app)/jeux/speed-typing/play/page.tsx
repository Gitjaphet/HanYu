// src/app/(app)/jeux/speed-typing/play/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import SpeedTyping from "@/components/games/SpeedTyping/SpeedTyping";
import { Suspense } from "react";

function PlaySpeedTypingContent() {
  const searchParams = useSearchParams();
  const level = searchParams.get("level") || "A";

  return <SpeedTyping level={level} />;
}

export default function PlaySpeedTypingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><p className="text-text-muted font-bold">Chargement...</p></div>}>
      <PlaySpeedTypingContent />
    </Suspense>
  );
}