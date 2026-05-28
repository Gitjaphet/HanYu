// src/app/(app)/jeux/speed-typing/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Play, Keyboard } from "lucide-react";
import PandaMascot from "@/components/lesson/PandaMascot/PandaMascot";

export default function SpeedTypingConfigPage() {
  const router = useRouter();
  const [level, setLevel] = useState("A");

  const handleStart = () => {
    router.push(`/jeux/speed-typing/play?level=${level}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 flex flex-col min-h-screen">
      
      {/* Header */}
      <div className="mb-4">
        <Link 
          href="/jeux"
          className="inline-flex items-center gap-2 px-3 py-2 -ml-3 text-sm font-bold text-text-muted hover:text-text hover:bg-black/5 rounded-xl transition-all"
        >
          <ChevronLeft size={20} />
          Retour aux jeux
        </Link>
      </div>

      {/* En-tête */}
      <div className="flex items-center gap-4 sm:gap-6 mb-8 bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-sm">
        <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0">
          <PandaMascot state="speaking" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-text">Speed Typing ⌨️</h1>
          <p className="text-sm sm:text-base text-text-muted font-medium mt-1">
            Tape les hanzi le plus vite possible. N'oublie pas d'activer ton clavier chinois !
          </p>
        </div>
      </div>
      
      {/* Configuration */}
      <div className="flex flex-col gap-6 flex-1">
        <section>
          <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">Choisis ton niveau</h2>
          <div className="grid grid-cols-3 gap-3">
            {["A", "B", "C"].map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`py-4 rounded-xl border-2 font-bold transition-all ${
                  level === l 
                    ? "border-orange-500 bg-orange-50 text-orange-700" 
                    : "border-border bg-card text-text-muted hover:border-text-muted"
                }`}
              >
                Niv. {l}
              </button>
            ))}
          </div>
        </section>

        <div className="mt-auto pt-6">
          <button
            onClick={handleStart}
            className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl shadow-sm hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Play size={20} />
            Commencer la partie
          </button>
        </div>
      </div>
    </div>
  );
}