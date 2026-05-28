// src/components/games/PhraseMystere/PhraseMystere.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Trophy, AlertTriangle, RotateCcw, Heart } from "lucide-react";
import { MOCK_LESSONS } from "@/lib/constants";
import { DialogueLine } from "@/types";
import PandaMascot from "@/components/lesson/PandaMascot/PandaMascot";

const MAX_HEARTS = 3;
const ROUNDS_PER_GAME = 5;

// Fonction pour nettoyer la ponctuation chinoise et séparer les caractères
function getCleanChars(hanziString: string) {
  const cleanStr = hanziString.replace(/[，。！？、?!\s]/g, "");
  return cleanStr.split("");
}

export default function PhraseMystere({ level }: { level: string }) {
  const router = useRouter();

  const [rounds, setRounds] = useState<DialogueLine[]>([]);
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  
  // État du round en cours
  const [shuffledChars, setShuffledChars] = useState<{ id: string; char: string }[]>([]);
  const [selectedChars, setSelectedChars] = useState<{ id: string; char: string }[]>([]);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const [isWon, setIsWon] = useState(false);
  const [isLost, setIsLost] = useState(false);

  // Initialiser la partie
  const initGame = useCallback(() => {
    // 1. Récupérer tous les dialogues du niveau
    const lessons = MOCK_LESSONS.filter((l) => l.levelId === level);
    const allDialogues = lessons.flatMap((l) => l.dialogue);

    if (allDialogues.length === 0) return;

    // 2. Prendre X dialogues au hasard
    const selected = [...allDialogues].sort(() => Math.random() - 0.5).slice(0, ROUNDS_PER_GAME);
    setRounds(selected);
    setCurrentRoundIdx(0);
    setHearts(MAX_HEARTS);
    setIsWon(false);
    setIsLost(false);
    loadRound(selected[0]);
  }, [level]);

  // Charger un round spécifique
  const loadRound = (line: DialogueLine) => {
    const chars = getCleanChars(line.hanzi);
    // Créer un tableau d'objets avec un ID unique (pour gérer les caractères identiques)
    const charObjects = chars.map((char, i) => ({ id: `${i}-${char}`, char }));
    
    // Mélanger les blocs
    setShuffledChars(charObjects.sort(() => Math.random() - 0.5));
    setSelectedChars([]);
    setStatus("idle");
  };

  useEffect(() => {
    initGame();
  }, [initGame]);

  const currentLine = rounds[currentRoundIdx];

  // Actions utilisateur
  const handleSelectChar = (item: { id: string; char: string }) => {
    if (status === "success") return;
    setStatus("idle");
    setShuffledChars((prev) => prev.filter((c) => c.id !== item.id));
    setSelectedChars((prev) => [...prev, item]);
  };

  const handleDeselectChar = (item: { id: string; char: string }) => {
    if (status === "success") return;
    setStatus("idle");
    setSelectedChars((prev) => prev.filter((c) => c.id !== item.id));
    setShuffledChars((prev) => [...prev, item]);
  };

  // Vérifier la réponse
  const handleCheck = () => {
    if (!currentLine) return;
    const userAnswer = selectedChars.map((c) => c.char).join("");
    const correctAnswer = getCleanChars(currentLine.hanzi).join("");

    if (userAnswer === correctAnswer) {
      setStatus("success");
    } else {
      setStatus("error");
      setHearts((prev) => prev - 1);
      if (hearts - 1 <= 0) {
        setIsLost(true);
      }
    }
  };

  // Passer au round suivant
  const handleNextRound = () => {
    if (currentRoundIdx + 1 >= rounds.length) {
      setIsWon(true);
    } else {
      const nextIdx = currentRoundIdx + 1;
      setCurrentRoundIdx(nextIdx);
      loadRound(rounds[nextIdx]);
    }
  };

  if (!currentLine && !isWon && !isLost) return null;

  return (
    <div className="fixed inset-0 bg-background z-[90] flex flex-col h-[100dvh] select-none">
      
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <button 
          onClick={() => router.push("/jeux/phrase-mystere")}
          className="p-2 -ml-2 text-text-muted hover:text-text rounded-full"
        >
          <ChevronLeft size={24} />
        </button>
        
        {/* Barre de progression simple */}
        <div className="flex-1 max-w-[150px] mx-4 h-2 bg-border rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${(currentRoundIdx / ROUNDS_PER_GAME) * 100}%` }}
          />
        </div>

        {/* Vies */}
        <div className="flex items-center gap-1 text-red-500">
          {Array.from({ length: MAX_HEARTS }).map((_, i) => (
            <Heart key={i} size={18} fill={i < hearts ? "currentColor" : "transparent"} className={i < hearts ? "" : "text-border"} />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start p-4 overflow-y-auto w-full max-w-2xl mx-auto">
        
        {/* ECRAN VICTOIRE */}
        {isWon && (
          <div className="text-center animate-in zoom-in duration-300 mt-10 w-full px-4">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Trophy size={48} className="text-yellow-500" />
            </div>
            <h2 className="text-3xl font-black text-text mb-2">Parfait ! 🎉</h2>
            <p className="text-text-muted mb-8">Tu as reconstitué toutes les phrases avec succès.</p>
            <div className="flex flex-col gap-3 w-full">
              <button onClick={initGame} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2">
                <RotateCcw size={20} /> Rejouer
              </button>
              <button onClick={() => router.push("/jeux")} className="w-full bg-card border-2 border-border text-text font-bold py-4 rounded-xl shadow-sm active:scale-95 transition-all">
                Quitter
              </button>
            </div>
          </div>
        )}

        {/* ECRAN DEFAITE */}
        {isLost && (
          <div className="text-center animate-in zoom-in duration-300 mt-10 w-full px-4">
            <div className="scale-110 mb-6"><PandaMascot state="fail" /></div>
            <div className="flex items-center justify-center gap-2 text-red-600 mb-2">
              <AlertTriangle size={24} />
              <h2 className="text-2xl font-black">Plus de vies ! 💔</h2>
            </div>
            <p className="text-text-muted mb-8 font-medium">Réessaie, l'ordre des mots en chinois demande un peu de pratique.</p>
            <div className="flex flex-col gap-3 w-full">
              <button onClick={initGame} className="w-full bg-red-500 text-white font-bold py-4 rounded-xl shadow-sm hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center gap-2">
                <RotateCcw size={20} /> Réessayer
              </button>
              <button onClick={() => router.push("/jeux")} className="w-full bg-card border-2 border-border text-text font-bold py-4 rounded-xl shadow-sm active:scale-95 transition-all">
                Retour aux jeux
              </button>
            </div>
          </div>
        )}

        {/* PLATEAU ACTIF */}
        {!isWon && !isLost && currentLine && (
          <div className="w-full flex flex-col items-center animate-in fade-in">
            <div className="scale-75 sm:scale-90 mb-2">
              <PandaMascot state={status === "success" ? "success" : status === "error" ? "fail" : "idle"} />
            </div>

            {/* Indice en Français */}
            <div className="bg-card border-2 border-border rounded-2xl p-4 sm:p-6 w-full text-center mb-6 shadow-sm">
              <p className="text-sm text-text-muted uppercase tracking-wider font-bold mb-2">Que signifie :</p>
              <p className="text-xl sm:text-2xl font-bold text-text">"{currentLine.french}"</p>
              {status === "success" && (
                <p className="text-blue-500 font-bold mt-2 text-sm">{currentLine.pinyin}</p>
              )}
            </div>

            {/* Zone de réponse (mots sélectionnés) */}
            <div className={`min-h-[80px] w-full border-b-2 border-dashed flex flex-wrap items-center justify-center gap-2 pb-4 mb-6 transition-colors ${status === "error" ? "border-red-400" : status === "success" ? "border-green-400" : "border-border"}`}>
              {selectedChars.length === 0 && <span className="text-text-muted opacity-50 text-sm">Tapote les mots pour construire la phrase</span>}
              {selectedChars.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleDeselectChar(item)}
                  className={`px-4 py-3 rounded-xl font-bold text-xl sm:text-2xl shadow-sm active:scale-95 transition-all ${status === "success" ? "bg-green-100 text-green-700 border border-green-300" : status === "error" ? "bg-red-100 text-red-700 border border-red-300 animate-shake" : "bg-white text-text border border-border hover:bg-gray-50"}`}
                >
                  {item.char}
                </button>
              ))}
            </div>

            {/* Mots disponibles (mélangés) */}
            <div className="flex flex-wrap justify-center gap-3 mb-8 w-full">
              {shuffledChars.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectChar(item)}
                  className="px-5 py-3 rounded-xl bg-card border-2 border-border text-text font-bold text-xl sm:text-2xl shadow-sm active:scale-95 hover:border-blue-300 transition-all"
                >
                  {item.char}
                </button>
              ))}
            </div>

            {/* Feedback / Footer */}
            <div className="w-full mt-auto mb-4">
              {status === "idle" && shuffledChars.length === 0 && (
                <button onClick={handleCheck} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-sm active:scale-[0.98]">
                  Vérifier
                </button>
              )}
              {status === "success" && (
                <button onClick={handleNextRound} className="w-full py-4 bg-green-500 text-white font-bold rounded-xl shadow-sm active:scale-[0.98] animate-bounce">
                  Continuer
                </button>
              )}
              {status === "error" && (
                <p className="text-center text-red-500 font-bold mb-4 animate-pulse">Oups, l'ordre est incorrect ! Retire des mots et réessaie.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}