// components/lesson/RepeatPanel/RepeatPanel.tsx — panneau « répète au micro » : panda, consigne, micro, résultat.
// Commun au vocabulaire et au dialogue ; toute la logique vient de useRepeatAfterMe.
"use client";

import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, ChevronRight, Mic, MicOff, RotateCcw, Snail, Volume2 } from "lucide-react";
import PandaMascot, { type PandaState } from "@/components/lesson/PandaMascot/PandaMascot";
import { TRIES, type RepeatAfterMe, type RepeatPhase } from "@/hooks/useRepeatAfterMe";
import { speak } from "@/lib/speech";

const PANDA: Record<RepeatPhase, PandaState> = {
  waiting: "idle",
  speaking: "speaking",
  listening: "listening",
  success: "success",
  fail: "fail",
};

function statusText({ phase, heard, problem }: RepeatAfterMe): string {
  if (problem === "unsupported") return "Ton navigateur ne sait pas écouter. Utilise Chrome, Edge ou Safari, ou passe.";
  if (problem === "denied") return "Le micro est bloqué : autorise-le dans ton navigateur, puis réessaie.";
  switch (phase) {
    case "speaking": return "Écoute bien…";
    case "listening": return "Parle maintenant…";
    case "success": return "Bonne prononciation !";
    case "fail": return heard ? `Entendu : « ${heard} »` : "Pas de réponse détectée";
    default: return "Prépare-toi…";
  }
}

type Props = {
  repeat: RepeatAfterMe;
  hanzi: string;
  successText: string;
  onSkip: () => void;
};

export function RepeatPanel({ repeat, hanzi, successText, onSkip }: Props) {
  const { phase, attempt, problem, busy, retry } = repeat;
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 sm:gap-3 sm:p-5">
      <div className="origin-top scale-90 sm:scale-100">
        <PandaMascot state={PANDA[phase]} word={hanzi} />
      </div>
      <p role="status" aria-live="polite"
        className={`text-center text-xs font-bold uppercase tracking-wider ${problem ? "text-warning" : "text-text-muted"}`}>
        {statusText(repeat)}
      </p>
      {attempt > 0 && busy && <p className="text-xs font-bold text-warning">Essai {attempt + 1} / {TRIES}</p>}

      <MicButton phase={phase} onRetry={retry} />

      <AnimatePresence>
        {phase === "success" && (
          <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg bg-success-soft px-3 py-1.5 text-center text-xs font-bold text-success">
            {successText}
          </motion.p>
        )}
      </AnimatePresence>

      {phase === "fail" && (
        <div className="flex gap-2">
          <button type="button" onClick={retry}
            className="flex min-h-10 items-center gap-1.5 rounded-lg bg-warning-soft px-3 py-2 text-xs font-bold text-warning transition active:scale-95">
            <RotateCcw size={13} aria-hidden="true" /> Réessayer
          </button>
          <button type="button" onClick={onSkip}
            className="flex min-h-10 items-center gap-1.5 rounded-lg bg-tint px-3 py-2 text-xs font-bold text-text-muted transition hover:text-text active:scale-95">
            Passer <ChevronRight size={13} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

function MicButton({ phase, onRetry }: { phase: RepeatPhase; onRetry: () => void }) {
  if (phase === "listening") {
    return (
      <span className="relative flex h-14 w-14 items-center justify-center sm:h-16 sm:w-16" aria-hidden="true">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
        <span className="relative flex h-full w-full items-center justify-center rounded-full bg-primary text-white shadow-md">
          <Mic size={22} />
        </span>
      </span>
    );
  }
  const success = phase === "success";
  const fail = phase === "fail";
  return (
    <button
      type="button"
      onClick={onRetry}
      disabled={success || phase === "speaking"}
      aria-label={success ? "Réussi" : "Écouter et répéter de nouveau"}
      className={`flex h-14 w-14 items-center justify-center rounded-full text-white shadow-md transition sm:h-16 sm:w-16 ${
        success ? "cursor-default bg-success" : fail ? "bg-warning hover:brightness-110 active:scale-95" : "bg-primary hover:bg-primary-dark active:scale-95"
      }`}
    >
      {success ? <CheckCircle2 size={24} /> : fail ? <MicOff size={22} /> : <Mic size={22} />}
    </button>
  );
}

/** Boutons « Normal » / « Lent » pour réécouter un texte chinois. */
export function ListenButtons({ text, disabled = false, small = false }: { text: string; disabled?: boolean; small?: boolean }) {
  const size = small ? 12 : 13;
  const base = `flex min-h-9 items-center gap-1.5 rounded-lg text-xs font-bold transition active:scale-95 disabled:opacity-50 ${small ? "px-3 py-1.5" : "px-3 py-2 sm:px-4"}`;
  return (
    <div className="mt-2 flex items-center gap-2 sm:mt-3">
      <button type="button" disabled={disabled} onClick={() => void speak(text)}
        className={`${base} bg-primary/10 text-primary hover:bg-primary/20`}>
        <Volume2 size={size} aria-hidden="true" /> Normal
      </button>
      <button type="button" disabled={disabled} onClick={() => void speak(text, true)}
        className={`${base} bg-tint text-secondary hover:brightness-95 dark:text-primary`}>
        <Snail size={size} aria-hidden="true" /> Lent
      </button>
    </div>
  );
}
