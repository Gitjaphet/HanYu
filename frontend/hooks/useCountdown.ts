// hooks/useCountdown.ts — compte à rebours en secondes, qu'on peut mettre en pause et prolonger (bonus)
"use client";

import { useCallback, useEffect, useState } from "react";

export function useCountdown(seconds: number, running: boolean) {
  const [left, setLeft] = useState(seconds);
  const over = left <= 0;

  // Un seul minuteur tant que le jeu tourne ; il s'arrête de lui-même à zéro
  useEffect(() => {
    if (!running || over) return;
    const timer = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [running, over]);

  const addTime = useCallback((bonus: number) => setLeft((s) => s + bonus), []);
  return { left, over, addTime };
}
