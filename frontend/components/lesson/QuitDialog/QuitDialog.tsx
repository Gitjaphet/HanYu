// components/lesson/QuitDialog/QuitDialog.tsx — « Quitter la leçon ? », commun au vocabulaire, au dialogue et au quiz
"use client";

import { useEffect, useRef } from "react";

type Props = {
  title: string;
  message?: string;
  onStay: () => void;
  onQuit: () => void;
};

export function QuitDialog({ title, message = "Ta progression dans cette partie sera perdue.", onStay, onQuit }: Props) {
  const stayRef = useRef<HTMLButtonElement>(null);

  // Focus sur « Continuer » (le choix sans risque) ; Échap = continuer
  useEffect(() => {
    stayRef.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onStay();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onStay]);

  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={onStay}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="quit-title"
        aria-describedby="quit-message"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl"
      >
        <h3 id="quit-title" className="text-lg font-black text-text">{title}</h3>
        <p id="quit-message" className="mt-2 text-sm text-text-muted">{message}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onQuit}
            className="rounded-xl bg-danger-soft px-5 py-3 text-sm font-bold text-danger transition hover:brightness-95">
            Quitter
          </button>
          <button type="button" ref={stayRef} onClick={onStay}
            className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-dark">
            Continuer la leçon
          </button>
        </div>
      </div>
    </div>
  );
}
