// hooks/useRepeatAfterMe.ts — « Répète après moi » : faire entendre un texte chinois, écouter l'élève,
// jusqu'à TRIES essais. Utilisé par le vocabulaire (un mot) et le dialogue (une réplique).
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { listenOnce, matchesHanzi, speakRepeatAfterMe, stopSpeaking, type ListenError, type Listening } from "@/lib/speech";

export const TRIES = 3; // première écoute + 2 nouvelles tentatives
const LISTEN_TIMEOUT_MS = 15000;
const START_DELAY_MS = 500;

export type RepeatPhase = "waiting" | "speaking" | "listening" | "success" | "fail";

export type RepeatAfterMe = {
  phase: RepeatPhase;
  attempt: number;              // 0 pour le premier essai
  heard: string;                // ce que le navigateur a compris au dernier essai
  problem: ListenError | null;  // "unsupported" ou "denied" : l'élève doit agir, inutile de réessayer seul
  busy: boolean;                // en train de parler ou d'écouter
  retry: () => void;
  cancel: () => void;           // se taire et arrêter d'écouter (avant de changer de page, par exemple)
};

/**
 * Démarre tout seul au montage du composant, et reprend après une pause (paused → false).
 * Pour passer au texte suivant, monter un nouveau composant (key) : l'état repart de zéro.
 */
export function useRepeatAfterMe(hanzi: string, paused = false): RepeatAfterMe {
  const [phase, setPhase] = useState<RepeatPhase>("waiting");
  const [attempt, setAttempt] = useState(0);
  const [heard, setHeard] = useState("");
  const [problem, setProblem] = useState<ListenError | null>(null);

  const runId = useRef(0); // chaque séquence a un numéro : une séquence remplacée s'arrête d'elle-même
  const listening = useRef<Listening | null>(null);
  const settled = useRef(false); // réussi ou abandonné : on ne relance plus tout seul

  const cancel = useCallback(() => {
    runId.current += 1;
    listening.current?.stop();
    stopSpeaking();
  }, []);

  const run = useCallback(async () => {
    const id = ++runId.current;
    const alive = () => runId.current === id;
    settled.current = false;
    setProblem(null);
    setHeard("");

    for (let i = 0; i < TRIES; i++) {
      setAttempt(i);
      setPhase("speaking");
      await speakRepeatAfterMe(hanzi);
      if (!alive()) return;

      setPhase("listening");
      listening.current = listenOnce({ timeoutMs: LISTEN_TIMEOUT_MS });
      const { heard: candidates, error } = await listening.current.result;
      if (!alive() || error === "aborted") return;

      if (error === "unsupported" || error === "denied") {
        setProblem(error);
        break;
      }
      setHeard(candidates[0] ?? "");
      if (matchesHanzi(candidates, hanzi)) {
        settled.current = true;
        setPhase("success");
        return;
      }
    }
    settled.current = true;
    setPhase("fail");
  }, [hanzi]);

  useEffect(() => {
    if (paused || settled.current) return;
    const timer = setTimeout(run, START_DELAY_MS);
    return () => {
      clearTimeout(timer);
      cancel();
    };
  }, [paused, run, cancel]);

  return {
    phase,
    attempt,
    heard,
    problem,
    busy: phase === "speaking" || phase === "listening",
    retry: () => void run(),
    cancel,
  };
}
