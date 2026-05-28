// src/app/(app)/jeux/page.tsx
import Link from "next/link";
import { Gamepad2, Keyboard, Puzzle } from "lucide-react";
import PandaMascot from "@/components/lesson/PandaMascot/PandaMascot";

export default function GamesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      
      {/* En-tête global avec Mascotte */}
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-10 bg-card p-6 sm:p-8 rounded-3xl border border-border shadow-sm">
        <div className="w-32 h-32 shrink-0">
          <PandaMascot state="success" />
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-black text-text mb-2">Espace Jeux 🎮</h1>
          <p className="text-text-muted font-medium text-lg">
            Apprends en t'amusant ! Choisis un jeu pour réviser ton vocabulaire.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Hanzi Hunt (Actif) */}
        <Link 
          href="/jeux/hanzi-hunt"
          className="bg-card border-2 border-border rounded-2xl p-6 hover:border-primary transition-all group shadow-sm active:scale-[0.98]"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Gamepad2 size={24} />
          </div>
          <h2 className="text-xl font-bold text-text mb-1">Hanzi Hunt</h2>
          <p className="text-sm text-text-muted">
            Entraîne ta mémoire ! Trouve les paires de cartes avant la fin du temps.
          </p>
        </Link>

        {/* 2. Speed Typing (Actif) */}
        <Link 
          href="/jeux/speed-typing"
          className="bg-card border-2 border-border rounded-2xl p-6 hover:border-orange-500 transition-all group shadow-sm active:scale-[0.98]"
        >
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Keyboard size={24} />
          </div>
          <h2 className="text-xl font-bold text-text mb-1">Speed Typing</h2>
          <p className="text-sm text-text-muted">
            Lis le pinyin ou le français et tape le hanzi le plus vite possible !
          </p>
        </Link>

        {/* 3. Phrase Mystère (Actif) */}
        <Link 
          href="/jeux/phrase-mystere"
          className="bg-card border-2 border-border rounded-2xl p-6 hover:border-blue-500 transition-all group shadow-sm active:scale-[0.98]"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Puzzle size={24} />
          </div>
          <h2 className="text-xl font-bold text-text mb-1">Phrase Mystère</h2>
          <p className="text-sm text-text-muted">
            Remets les mots du dialogue dans le bon ordre. Idéal pour la grammaire !
          </p>
        </Link>
      </div>
    </div>
  );
}