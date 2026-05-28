// src/app/(app)/jeux/hanzi-hunt/page.tsx
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import LevelSelect from "@/components/games/HanziHunt/LevelSelect";
import PandaMascot from "@/components/lesson/PandaMascot/PandaMascot";

export default function HanziHuntConfigPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 flex flex-col min-h-screen">
      
      {/* Header avec bouton retour */}
      <div className="mb-4">
        <Link 
          href="/jeux"
          className="inline-flex items-center gap-2 px-3 py-2 -ml-3 text-sm font-bold text-text-muted hover:text-text hover:bg-black/5 rounded-xl transition-all"
        >
          <ChevronLeft size={20} />
          Retour aux jeux
        </Link>
      </div>

      {/* En-tête de la page avec Mascotte */}
      <div className="flex items-center gap-4 sm:gap-6 mb-8 bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-sm">
        <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0">
          <PandaMascot state="idle" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-text">Hanzi Hunt 🧩</h1>
          <p className="text-sm sm:text-base text-text-muted font-medium mt-1">
            Configure ta partie avant de commencer.
          </p>
        </div>
      </div>
      
      {/* Composant qui gère la sélection (Niveau, Mode) et le bouton Start */}
      <LevelSelect />
      
    </div>
  );
}