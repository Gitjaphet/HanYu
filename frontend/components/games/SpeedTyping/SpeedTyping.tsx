// src/components/games/SpeedTyping/SpeedTyping.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Trophy, AlertTriangle, RotateCcw, Clock, CheckCircle2 } from "lucide-react";
import { MOCK_LESSONS } from "@/lib/constants";
import PandaMascot from "@/components/lesson/PandaMascot/PandaMascot";

const INITIAL_TIME = 45; // Secondes
const BONUS_TIME = 3;    // Secondes gagnées par bonne réponse

type VocabWord = {
  id: number | string;
  hanzi: string;
  pinyin: string;
  french: string;
};

export default function SpeedTyping({ level }: { level: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [words, setWords] = useState<VocabWord[]>([]);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [inputValue, setInputValue] = useState("");
  
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [isGameOver, setIsGameOver] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  // Initialisation
  const initGame = useCallback(() => {
    const lessons = MOCK_LESSONS.filter(l => l.levelId === level);
    const allVocab = lessons.flatMap(l => l.vocabulaire);
    
    // On mélange beaucoup de mots (s'il n'y en a pas assez, on les duplique)
    let gameWords = [...allVocab].sort(() => Math.random() - 0.5);
    if (gameWords.length < 20) {
      gameWords = [...gameWords, ...gameWords, ...gameWords].sort(() => Math.random() - 0.5);
    }

    setWords(gameWords);
    setCurrentWordIdx(0);
    setScore(0);
    setTimeLeft(INITIAL_TIME);
    setInputValue("");
    setIsGameOver(false);
    setStatus("idle");
    
    // Focus l'input au démarrage
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [level]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Chronomètre
  useEffect(() => {
    if (isGameOver || words.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameOver, words.length]);

  const currentWord = words[currentWordIdx];

  // Vérification de la saisie
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Si on tape exactement le bon hanzi (ignorant les espaces)
    if (value.replace(/\s/g, "") === currentWord?.hanzi) {
      setStatus("success");
      setScore(s => s + 1);
      setTimeLeft(t => t + BONUS_TIME); // Bonus de temps !
      
      // Petit délai pour voir l'effet vert avant de passer au mot suivant
      setTimeout(() => {
        setInputValue("");
        setStatus("idle");
        setCurrentWordIdx(idx => idx + 1);
      }, 300);
    } else if (value.length >= currentWord?.hanzi.length && value.replace(/\s/g, "") !== currentWord?.hanzi) {
      // Si la longueur est atteinte mais c'est faux
      setStatus("error");
    } else {
      setStatus("idle");
    }
  };

  // Passer le mot si c'est trop dur (Touche Entrée avec champ vide)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue === "") {
      setStatus("error");
      setTimeout(() => {
        setInputValue("");
        setStatus("idle");
        setCurrentWordIdx(idx => idx + 1);
      }, 300);
    }
  };

  if (!currentWord && !isGameOver) return null;

  return (
    <div className="fixed inset-0 bg-background z-[90] flex flex-col h-[100dvh] select-none">
      
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <button 
          onClick={() => router.push("/jeux/speed-typing")}
          className="p-2 -ml-2 text-text-muted hover:text-text rounded-full"
        >
          <ChevronLeft size={24} />
        </button>
        
        <div className="text-center">
          <h2 className="font-black text-text leading-tight">Speed Typing</h2>
          <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mt-0.5">
            Score : {score}
          </p>
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-sm tabular-nums transition-colors ${
          timeLeft <= 10 
            ? "bg-red-50 border-red-200 text-red-600 animate-pulse" 
            : "bg-orange-50 border-orange-200 text-orange-600"
        }`}>
          <Clock size={15} />
          <span>{timeLeft}s</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-xl mx-auto">
        
        {/* ECRAN FIN DE PARTIE */}
        {isGameOver ? (
          <div className="text-center animate-in zoom-in duration-300 w-full px-4">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Trophy size={48} className="text-orange-500" />
            </div>
            <h2 className="text-3xl font-black text-text mb-2">Temps écoulé ! ⏱️</h2>
            <p className="text-text-muted mb-8 text-lg">
              Tu as tapé <span className="font-bold text-text">{score} mots</span> corrects.
            </p>
            <div className="flex flex-col gap-3 w-full">
              <button onClick={initGame} className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2">
                <RotateCcw size={20} /> Rejouer
              </button>
              <button onClick={() => router.push("/jeux")} className="w-full bg-card border-2 border-border text-text font-bold py-4 rounded-xl shadow-sm active:scale-95 transition-all">
                Quitter
              </button>
            </div>
          </div>
        ) : (
          
          /* PLATEAU DE JEU ACTIF */
          <div className="w-full flex flex-col items-center">
            
            <div className="scale-90 mb-4 h-24">
              <PandaMascot state={status === "success" ? "success" : status === "error" ? "fail" : "idle"} />
            </div>

            {/* Carte Mot à traduire */}
            <div className="bg-card border-2 border-border rounded-2xl p-6 w-full text-center mb-8 shadow-sm relative overflow-hidden">
              {status === "success" && (
                <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center animate-in fade-in z-0">
                  <CheckCircle2 size={100} className="text-green-500 opacity-20" />
                </div>
              )}
              
              <div className="relative z-10">
                <p className="text-sm text-text-muted uppercase tracking-wider font-bold mb-3">Tape le hanzi pour :</p>
                <p className="text-3xl font-black text-text mb-2">{currentWord?.french}</p>
                <p className="text-xl font-bold text-orange-500">{currentWord?.pinyin}</p>
                <p className="text-xs text-text-muted mt-4 opacity-50">Appuie sur Entrée avec le champ vide pour passer</p>
              </div>
            </div>

            {/* Input Utilisateur */}
            <div className="w-full relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Tape ici..."
                autoFocus
                className={`w-full text-center text-3xl font-black py-5 rounded-2xl border-2 outline-none transition-colors shadow-inner
                  ${status === "success" ? "border-green-500 bg-green-50 text-green-700" 
                  : status === "error" ? "border-red-500 bg-red-50 text-red-700 animate-shake" 
                  : "border-border bg-card text-text focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20"}`}
              />
              
              {/* Message bonus de temps flottant */}
              {status === "success" && (
                <div className="absolute -top-8 right-4 text-green-500 font-black animate-bounce">
                  +{BONUS_TIME}s
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}