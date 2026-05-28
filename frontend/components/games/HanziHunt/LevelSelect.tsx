// src/components/games/HanziHunt/LevelSelect.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";

const MODES = [
  { id: "hanzi-fr", label: "漢字 ➔ Français", desc: "Le plus facile, idéal débutant" },
  { id: "pinyin-fr", label: "Pinyin ➔ Français", desc: "Renforce la lecture" },
  { id: "hanzi-pinyin", label: "漢字 ➔ Pinyin", desc: "Plus difficile" },
];

export default function LevelSelect() {
  const router = useRouter();
  const [level, setLevel] = useState("A");
  const [mode, setMode] = useState("hanzi-fr");

  const handleStart = () => {
    // Redirection vers le plateau de jeu avec les paramètres choisis
    router.push(`/jeux/hanzi-hunt/play?level=${level}&mode=${mode}`);
  };

  return (
    <div className="flex flex-col gap-6 flex-1">
      
      {/* Choix du niveau */}
      <section>
        <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">1. Choisis ton niveau</h2>
        <div className="grid grid-cols-3 gap-3">
          {["A", "B", "C"].map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`py-4 rounded-xl border-2 font-bold transition-all ${
                level === l 
                  ? "border-primary bg-primary/10 text-primary" 
                  : "border-border bg-card text-text-muted hover:border-text-muted"
              }`}
            >
              Niv. {l}
            </button>
          ))}
        </div>
      </section>

      {/* Choix du mode */}
      <section>
        <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">2. Mode de jeu</h2>
        <div className="flex flex-col gap-3">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col ${
                mode === m.id 
                  ? "border-green-500 bg-green-50 text-green-700" 
                  : "border-border bg-card text-text hover:border-text-muted"
              }`}
            >
              <span className="font-bold">{m.label}</span>
              <span className="text-xs opacity-80 mt-1">{m.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Bouton pour lancer */}
      <div className="mt-auto pt-6">
        <button
          onClick={handleStart}
          className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Play size={20} />
          Commencer la partie
        </button>
      </div>
    </div>
  );
}