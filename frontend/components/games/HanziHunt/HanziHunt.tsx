// src/components/games/HanziHunt/HanziHunt.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Trophy, RotateCcw, Clock, AlertTriangle } from "lucide-react";
import type { Lesson } from "@/types";
import PandaMascot from "@/components/lesson/PandaMascot/PandaMascot";

// Temps imparti pour le jeu (en secondes)
const TIME_LIMIT = 45; 

type Card = {
  id: string;      
  pairId: string;  
  text: string;    
  isFlipped: boolean;
  isMatched: boolean;
};

// --- Sous-composant : La carte ---
function GameCard({ card, onClick }: { card: Card; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={card.isFlipped || card.isMatched}
      className={`relative w-full aspect-square rounded-xl transition-all duration-500 [transform-style:preserve-3d] ${
        card.isFlipped || card.isMatched ? "[transform:rotateY(180deg)]" : ""
      }`}
    >
      {/* Face cachée (Dos) */}
      <div className="absolute inset-0 bg-primary/10 border-2 border-primary/20 rounded-xl flex items-center justify-center [backface-visibility:hidden] shadow-sm hover:bg-primary/20 transition-colors cursor-pointer">
        <span className="text-3xl opacity-20">❓</span>
      </div>

      {/* Face visible */}
      <div className={`absolute inset-0 rounded-xl flex items-center justify-center p-2 [transform:rotateY(180deg)] [backface-visibility:hidden] border-2 shadow-md ${
        card.isMatched ? "bg-green-50 border-green-400 text-green-700" : "bg-card border-secondary text-text"
      }`}>
        <span className="font-bold text-center break-words text-sm sm:text-base leading-tight">
          {card.text}
        </span>
      </div>
    </button>
  );
}

// --- Composant Principal : Le Jeu ---
export default function HanziHunt({ level, mode, lessons }: { level: string; mode: string; lessons: Lesson[] }) {
  const router = useRouter();
  
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isLocked, setIsLocked] = useState(false); 
  const [isWon, setIsWon] = useState(false);

  // ── Chronomètre & Tentatives ──
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [isLost, setIsLost] = useState(false);
  const [attempts, setAttempts] = useState(1);

  // Initialisation ou réinitialisation du jeu
  const initializeGame = useCallback((isRetry = false) => {
    const allVocab = lessons.flatMap(l => l.vocabulaire);
    const selectedVocab = [...allVocab].sort(() => Math.random() - 0.5).slice(0, 6);

    if (selectedVocab.length === 0) return;

    const gameCards: Card[] = [];
    selectedVocab.forEach((word) => {
      let textA = "";
      let textB = "";

      if (mode === "hanzi-fr") { textA = word.hanzi; textB = word.french; }
      else if (mode === "pinyin-fr") { textA = word.pinyin; textB = word.french; }
      else if (mode === "hanzi-pinyin") { textA = word.hanzi; textB = word.pinyin; }
      else { textA = word.hanzi; textB = word.french; }

      gameCards.push({
        id: `${word.id}-A`, pairId: word.id.toString(), text: textA,
        isFlipped: false, isMatched: false
      });
      gameCards.push({
        id: `${word.id}-B`, pairId: word.id.toString(), text: textB,
        isFlipped: false, isMatched: false
      });
    });

    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
    
    setCards(shuffledCards);
    setFlippedIndices([]);
    setMatches(0);
    setMoves(0);
    setIsWon(false);
    setIsLocked(false);
    
    // Reset du chrono et de l'état perdu
    setTimeLeft(TIME_LIMIT);
    setIsLost(false);

    // Si c'est un retry après avoir perdu, on incrémente l'essai
    if (isRetry) {
      setAttempts(a => a + 1);
    } else {
      // Si on gagne et qu'on relance complètement une nouvelle partie
      setAttempts(1);
    }
  }, [lessons, mode]);

  useEffect(() => {
    initializeGame(false);
  }, [initializeGame]);

  // ── Gestion du compte à rebours (Timer) ──
  useEffect(() => {
    if (isWon || isLost || cards.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsLost(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isWon, isLost, cards.length]);

  // Gestion du clic sur une carte
  const handleCardClick = (index: number) => {
    if (isLocked || cards[index].isFlipped || cards[index].isMatched || isLost) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    if (newFlippedIndices.length === 2) {
      setIsLocked(true);
      setMoves(m => m + 1);

      const [idx1, idx2] = newFlippedIndices;
      const card1 = newCards[idx1];
      const card2 = newCards[idx2];

      if (card1.pairId === card2.pairId) {
        setTimeout(() => {
          setCards(prev => {
            const matched = [...prev];
            matched[idx1].isMatched = true;
            matched[idx2].isMatched = true;
            return matched;
          });
          setMatches(m => m + 1);
          setFlippedIndices([]);
          setIsLocked(false);
          
          if (matches + 1 === cards.length / 2) {
            setIsWon(true);
          }
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => {
            const reset = [...prev];
            reset[idx1].isFlipped = false;
            reset[idx2].isFlipped = false;
            return reset;
          });
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1200);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-[90] flex flex-col h-[100dvh] select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <button 
          onClick={() => router.push("/jeux/hanzi-hunt")}
          className="p-2 -ml-2 text-text-muted hover:text-text rounded-full"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className="font-black text-text leading-tight">Hanzi Hunt</h2>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">
            Niv {level} • Essai n°{attempts}
          </p>
        </div>

        {/* Affichage du Timer */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-sm tabular-nums transition-colors ${
          timeLeft <= 10 
            ? "bg-red-50 border-red-200 text-red-600 animate-pulse" 
            : "bg-secondary/5 border-border text-text"
        }`}>
          <Clock size={15} className={timeLeft <= 10 ? "text-red-500" : "text-text-muted"} />
          <span>{timeLeft}s</span>
        </div>
      </div>

      {/* Zone de jeu centrale */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto">
        
        {/* ÉCRAN VICTOIRE */}
        {isWon && (
          <div className="text-center animate-in zoom-in duration-300 max-w-sm w-full px-4">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Trophy size={48} className="text-yellow-500" />
            </div>
            <h2 className="text-3xl font-black text-text mb-2">Gagné ! 🎉</h2>
            <p className="text-text-muted mb-6 font-medium">
              Tu as réussi en <span className="text-text font-bold">{moves} coups</span> et après <span className="text-text font-bold">{attempts} {attempts > 1 ? "tentatives" : "tentative"}</span>.
            </p>
            
            <div className="flex flex-col gap-3 w-full">
              <button 
                onClick={() => initializeGame(false)} // Nouvelle partie (essais reset à 1)
                className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} /> Rejouer
              </button>
              <button 
                onClick={() => router.push("/jeux")}
                className="w-full bg-card border-2 border-border text-text font-bold py-4 rounded-xl shadow-sm active:scale-95 transition-all"
              >
                Quitter
              </button>
            </div>
          </div>
        )}

        {/* ÉCRAN DÉFAITE (TEMPS ÉCOULÉ) */}
        {isLost && (
          <div className="text-center animate-in zoom-in duration-300 max-w-sm w-full px-4">
            <div className="scale-110 mb-6">
              <PandaMascot state="fail" />
            </div>
            <div className="flex items-center justify-center gap-2 text-red-600 mb-2">
              <AlertTriangle size={24} />
              <h2 className="text-2xl font-black">Temps écoulé ! ⏳</h2>
            </div>
            <p className="text-text-muted mb-8 font-medium">
              Dommage ! Tu as échoué à la tentative n°{attempts}. Ne baisse pas les bras !
            </p>
            
            <div className="flex flex-col gap-3 w-full">
              <button 
                onClick={() => initializeGame(true)} // Vrai Retry (incrémente attempts)
                className="w-full bg-red-500 text-white font-bold py-4 rounded-xl shadow-sm hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} /> Réessayer (Essai {attempts + 1})
              </button>
              <button 
                onClick={() => router.push("/jeux")}
                className="w-full bg-card border-2 border-border text-text font-bold py-4 rounded-xl shadow-sm active:scale-95 transition-all"
              >
                Retour aux jeux
              </button>
            </div>
          </div>
        )}

        {/* PLATEAU DE JEU ACTIF */}
        {!isWon && !isLost && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 w-full max-w-lg mx-auto">
            {cards.map((card, index) => (
              <GameCard 
                key={index} 
                card={card} 
                onClick={() => handleCardClick(index)} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}