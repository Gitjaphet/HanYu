// components/games/shared/GameOver.tsx — écran de fin de partie, gagnée ou perdue
"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { AlertTriangle, RotateCcw, Trophy } from "lucide-react";
import PandaMascot from "@/components/lesson/PandaMascot/PandaMascot";

export function GameOver({ won, title, children, retryLabel = "Rejouer", onRetry, onQuit }: {
  won: boolean;
  title: string;
  children: ReactNode; // le bilan : score, coups, temps…
  retryLabel?: string;
  onRetry: () => void;
  onQuit: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="m-auto flex w-full max-w-sm flex-col items-center text-center" role="status">
      {won ? (
        <span className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-warning-soft text-warning shadow-lg">
          <Trophy size={48} aria-hidden="true" />
        </span>
      ) : (
        <div className="mb-4 scale-110"><PandaMascot state="fail" /></div>
      )}
      <h2 className={`mb-2 flex items-center gap-2 text-2xl font-black sm:text-3xl ${won ? "text-text" : "text-danger"}`}>
        {!won && <AlertTriangle size={24} aria-hidden="true" />}
        {title}
      </h2>
      <div className="mb-8 font-medium text-text-muted">{children}</div>
      <div className="flex w-full flex-col gap-3">
        <button type="button" onClick={onRetry} autoFocus
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-white shadow-sm transition hover:bg-primary-dark active:scale-95">
          <RotateCcw size={20} aria-hidden="true" /> {retryLabel}
        </button>
        <button type="button" onClick={onQuit}
          className="w-full rounded-xl border-2 border-border bg-card py-4 font-bold text-text shadow-sm transition hover:bg-tint active:scale-95">
          Retour aux jeux
        </button>
      </div>
    </motion.div>
  );
}
