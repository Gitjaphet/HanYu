// components/games/SpeedTyping.tsx — taper le hanzi le plus vite possible (clavier chinois)
"use client";

import { useEffect, useRef, useState, type ChangeEvent, type CompositionEvent, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, SkipForward } from "lucide-react";
import { checkTyping, typingQueue } from "@/lib/games";
import { useCountdown } from "@/hooks/useCountdown";
import { GameOver } from "@/components/games/shared/GameOver";
import { GameShell, TimerBadge } from "@/components/games/shared/GameShell";
import PandaMascot from "@/components/lesson/PandaMascot/PandaMascot";
import type { VocabItem } from "@/types";

const START_TIME = 45;
const BONUS = 3;     // secondes gagnées par bonne réponse
const FLASH_MS = 300; // le temps de voir le vert ou le rouge avant le mot suivant

type Props = { words: VocabItem[]; level: string; onBack: () => void; onQuit: () => void };

export function SpeedTyping(props: Props) {
  const [round, setRound] = useState(0);
  return <TypingRound key={round} {...props} onReplay={() => setRound((r) => r + 1)} />;
}

type Status = "idle" | "success" | "error";

function TypingRound({ words, level, onBack, onQuit, onReplay }: Props & { onReplay: () => void }) {
  const [queue] = useState(() => typingQueue(words));
  const [idx, setIdx] = useState(0);
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [score, setScore] = useState(0);
  const composing = useRef(false); // clavier chinois : saisie du pinyin en cours, pas encore de hanzi
  const pending = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const timer = useCountdown(START_TIME, queue.length > 0);

  useEffect(() => () => clearTimeout(pending.current), []);

  const word = queue[idx % Math.max(queue.length, 1)];

  const nextWord = (flash: Status) => {
    setStatus(flash);
    pending.current = setTimeout(() => {
      setValue("");
      setStatus("idle");
      setIdx((i) => i + 1);
    }, FLASH_MS);
  };

  const evaluate = (text: string) => {
    const result = checkTyping(text, word.hanzi);
    if (result === "correct") {
      setScore((s) => s + 1);
      timer.addTime(BONUS);
      nextWord("success");
    } else {
      setStatus(result === "wrong" ? "error" : "idle");
    }
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (status === "success") return;
    setValue(event.target.value);
    if (!composing.current) evaluate(event.target.value);
  };

  const onCompositionEnd = (event: CompositionEvent<HTMLInputElement>) => {
    composing.current = false;
    evaluate(event.currentTarget.value);
  };

  const skip = () => {
    if (status !== "success") nextWord("error");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !composing.current && value.trim() === "") skip();
  };

  return (
    <GameShell title="Speed Typing" subtitle={`Niveau ${level} · Score ${score}`} onBack={onBack}
      right={<TimerBadge seconds={timer.left} />}>
      {queue.length === 0 ? (
        <p className="m-auto text-center font-bold text-text-muted">Pas encore de mots dans ce niveau.</p>
      ) : timer.over ? (
        <GameOver won={score > 0} title="Temps écoulé !" onRetry={onReplay} onQuit={onQuit}>
          Tu as tapé <strong className="text-text">{score} mot{score > 1 ? "s" : ""}</strong> correct{score > 1 ? "s" : ""}.
        </GameOver>
      ) : (
        <div className="m-auto flex w-full max-w-xl flex-col items-center">
          <div className="mb-2 h-24 scale-90">
            <PandaMascot state={status === "success" ? "success" : status === "error" ? "fail" : "idle"} />
          </div>

          <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="relative mb-6 w-full overflow-hidden rounded-2xl border-2 border-border bg-card p-6 text-center shadow-sm">
            {status === "success" && (
              <span className="absolute inset-0 flex items-center justify-center bg-success-soft" aria-hidden="true">
                <CheckCircle2 size={96} className="text-success opacity-25" />
              </span>
            )}
            <div className="relative">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-text-muted">Tape le hanzi de :</p>
              <p className="mb-2 text-2xl font-black text-text sm:text-3xl">{word.french}</p>
              <p className="text-lg font-bold text-warning sm:text-xl">{word.pinyin}</p>
            </div>
          </motion.div>

          <div className="relative w-full">
            <input
              type="text"
              lang="zh-CN"
              value={value}
              onChange={onChange}
              onCompositionStart={() => { composing.current = true; }}
              onCompositionEnd={onCompositionEnd}
              onKeyDown={onKeyDown}
              placeholder="Tape ici…"
              aria-label={`Hanzi de « ${word.french} »`}
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className={`w-full rounded-2xl border-2 py-5 text-center font-hanzi text-3xl font-black shadow-inner outline-none transition-colors ${
                status === "success" ? "border-success bg-success-soft text-success"
                : status === "error" ? "border-danger bg-danger-soft text-danger"
                : "border-border bg-card text-text focus:border-warning focus:ring-4 focus:ring-warning/20"}`}
            />
            <AnimatePresence>
              {status === "success" && (
                <motion.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: -4 }} exit={{ opacity: 0 }}
                  className="absolute -top-8 right-4 font-black text-success">
                  +{BONUS}s
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <button type="button" onClick={skip}
            className="mt-4 flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold text-text-muted transition hover:bg-tint hover:text-text">
            <SkipForward size={16} aria-hidden="true" /> Passer ce mot
            <span className="hidden text-xs font-semibold sm:inline">(Entrée, champ vide)</span>
          </button>
        </div>
      )}
    </GameShell>
  );
}
