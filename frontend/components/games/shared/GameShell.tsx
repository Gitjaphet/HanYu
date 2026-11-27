// components/games/shared/GameShell.tsx — cadre plein écran d'une partie : retour, titre, et un indicateur à droite
"use client";

import type { ReactNode } from "react";
import { ChevronLeft, Clock, Heart } from "lucide-react";

export function GameShell({ title, subtitle, onBack, right, children }: {
  title: string;
  subtitle?: string;
  onBack: () => void;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[90] flex h-[100dvh] flex-col bg-background select-none">
      <header className="flex items-center justify-between gap-3 border-b border-border bg-card px-3 py-2.5 sm:px-4 sm:py-3">
        <button type="button" onClick={onBack} aria-label="Quitter la partie" title="Quitter la partie"
          className="-ml-1 flex min-h-11 min-w-11 items-center justify-center rounded-lg text-text-muted transition hover:bg-tint hover:text-text">
          <ChevronLeft size={22} />
        </button>
        <div className="min-w-0 text-center">
          <h1 className="truncate font-black leading-tight text-text">{title}</h1>
          {subtitle && <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">{subtitle}</p>}
        </div>
        <div className="flex min-w-11 justify-end">{right}</div>
      </header>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-y-auto px-4 py-4 sm:py-6">{children}</main>
    </div>
  );
}

/** Temps restant ; passe en alerte sous 10 secondes. */
export function TimerBadge({ seconds }: { seconds: number }) {
  const low = seconds <= 10;
  return (
    <div role="timer" aria-label={`${seconds} secondes restantes`}
      className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-bold tabular-nums transition-colors ${
        low ? "animate-pulse border-danger/40 bg-danger-soft text-danger" : "border-border bg-tint text-text"}`}>
      <Clock size={15} aria-hidden="true" />
      {seconds}s
    </div>
  );
}

export function HeartsBadge({ left, total }: { left: number; total: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${left} vie${left > 1 ? "s" : ""} sur ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <Heart key={i} size={18} aria-hidden="true"
          className={`transition-all duration-300 ${i < left ? "fill-danger text-danger" : "text-border"}`} />
      ))}
    </div>
  );
}
