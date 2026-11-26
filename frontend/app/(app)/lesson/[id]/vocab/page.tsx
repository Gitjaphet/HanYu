// app/(app)/lesson/[id]/vocab/page.tsx — partie 1 : écouter chaque mot puis le répéter au micro
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, CheckCircle2, ChevronRight, Mic, MicOff, RotateCcw, Snail, Volume2 } from "lucide-react";
import { useLesson } from "@/hooks/useLessons";
import { useProgressStore } from "@/store/progressStore";
import { LessonLoading, LessonUnavailable } from "@/components/lesson/LessonState/LessonState";
import { QuitDialog } from "@/components/lesson/QuitDialog/QuitDialog";
import PandaMascot, { type PandaState } from "@/components/lesson/PandaMascot/PandaMascot";
import {
  listenOnce,
  matchesHanzi,
  speak,
  speakRepeatAfterMe,
  stopSpeaking,
  type ListenError,
  type Listening,
} from "@/lib/speech";
import type { VocabItem } from "@/types";

const LISTEN_TIMEOUT_MS = 15000;
const TRIES = 3; // première écoute + 2 nouvelles tentatives

type Phase = "waiting" | "speaking" | "listening" | "success" | "fail";

const PANDA: Record<Phase, PandaState> = {
  waiting: "idle",
  speaking: "speaking",
  listening: "listening",
  success: "success",
  fail: "fail",
};

export default function VocabPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { lesson, loading, error } = useLesson(Number(params.id));
  const completeVocab = useProgressStore((s) => s.completeVocab);

  // iOS n'autorise le son et le micro qu'après un geste de l'utilisateur : d'où l'écran « Démarrer »
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [confirmQuit, setConfirmQuit] = useState(false);

  const vocab: VocabItem[] = lesson?.vocabulaire ?? [];

  const goNext = useCallback(() => {
    if (!lesson) return;
    if (idx < vocab.length - 1) {
      setIdx((i) => i + 1);
    } else {
      completeVocab(lesson.id);
      router.push(`/lesson/${lesson.id}/dialogue`);
    }
  }, [idx, vocab.length, lesson, completeVocab, router]);

  const stay = useCallback(() => setConfirmQuit(false), []);

  if (loading) return <LessonLoading />;
  if (!lesson || vocab.length === 0) return <LessonUnavailable error={error} />;

  if (!started) {
    return (
      <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-background p-6 select-none">
        <span className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-tint text-primary">
          <Mic size={40} aria-hidden="true" />
        </span>
        <h2 className="mb-2 text-center text-2xl font-black text-text sm:text-3xl">Prêt à parler ?</h2>
        <p className="mb-8 max-w-xs text-center text-sm text-text-muted">
          Active le son et autorise le micro : tu vas écouter chaque mot, puis le répéter.
        </p>
        <button
          type="button"
          onClick={() => setStarted(true)}
          className="w-full max-w-xs rounded-xl bg-primary py-4 text-lg font-bold text-white shadow-lg transition hover:bg-primary-dark active:scale-95"
        >
          Démarrer l&apos;exercice
        </button>
        <button type="button" onClick={() => router.push("/")} className="mt-4 text-sm font-bold text-text-muted hover:text-text">
          Plus tard
        </button>
      </div>
    );
  }

  const progress = (idx / vocab.length) * 100;

  return (
    <div className="fixed inset-0 z-[90] flex h-[100dvh] flex-col overflow-hidden bg-background select-none">
      {confirmQuit && (
        <QuitDialog title="Quitter le vocabulaire ?" onStay={stay} onQuit={() => router.push("/")} />
      )}

      {/* En-tête : retour + progression */}
      <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-3 py-2 sm:gap-4 sm:px-4 sm:py-3">
        <button
          type="button"
          onClick={() => setConfirmQuit(true)}
          aria-label="Quitter le vocabulaire"
          className="-ml-1 rounded-lg p-2 text-text-muted transition hover:bg-tint hover:text-text"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-border sm:h-2.5" role="progressbar"
          aria-valuenow={idx} aria-valuemin={0} aria-valuemax={vocab.length} aria-label="Progression">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <span className="whitespace-nowrap text-xs font-bold text-text-muted tabular-nums">
          {idx + 1} / {vocab.length}
        </span>
      </div>

      <div className="mx-auto mb-1 w-full max-w-2xl px-3 sm:mb-2 sm:px-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
          Partie 1 · Vocabulaire — {lesson.title}
        </span>
      </div>

      {/* Un composant par mot : en changeant de mot, tout son état repart de zéro (key) */}
      <WordStep
        key={idx}
        word={vocab[idx]}
        isLast={idx === vocab.length - 1}
        paused={confirmQuit}
        onNext={goNext}
      />
    </div>
  );
}

type WordStepProps = {
  word: VocabItem;
  isLast: boolean;
  paused: boolean; // fenêtre « Quitter ? » ouverte : on se tait et on n'écoute plus
  onNext: () => void;
};

function WordStep({ word, isLast, paused, onNext }: WordStepProps) {
  const [phase, setPhase] = useState<Phase>("waiting");
  const [attempt, setAttempt] = useState(0);
  const [heard, setHeard] = useState("");
  const [problem, setProblem] = useState<ListenError | null>(null);
  const [showExample, setShowExample] = useState(false);

  const runId = useRef(0); // chaque séquence a un numéro : une séquence remplacée s'arrête d'elle-même
  const listening = useRef<Listening | null>(null);
  const settled = useRef(false); // réussi ou abandonné : on ne relance plus tout seul

  const cancel = useCallback(() => {
    runId.current += 1;
    listening.current?.stop();
    stopSpeaking();
  }, []);

  /** « Répète après moi », puis écoute, jusqu'à TRIES essais. */
  const run = useCallback(async () => {
    const id = ++runId.current;
    const alive = () => runId.current === id;
    settled.current = false;
    setProblem(null);
    setHeard("");

    for (let i = 0; i < TRIES; i++) {
      setAttempt(i);
      setPhase("speaking");
      await speakRepeatAfterMe(word.hanzi);
      if (!alive()) return;

      setPhase("listening");
      listening.current = listenOnce({ timeoutMs: LISTEN_TIMEOUT_MS });
      const { heard: candidates, error } = await listening.current.result;
      if (!alive() || error === "aborted") return;

      if (error === "unsupported" || error === "denied") {
        setProblem(error); // inutile de réessayer : l'élève doit agir (navigateur ou autorisation)
        break;
      }
      setHeard(candidates[0] ?? "");
      if (matchesHanzi(candidates, word.hanzi)) {
        settled.current = true;
        setPhase("success");
        return;
      }
    }
    settled.current = true;
    setPhase("fail");
  }, [word.hanzi]);

  // Démarre (ou reprend) la séquence, sauf pendant la fenêtre « Quitter ? » ou une fois le mot terminé
  useEffect(() => {
    if (paused || settled.current) return;
    const timer = setTimeout(run, 500);
    return () => {
      clearTimeout(timer);
      cancel();
    };
  }, [paused, run, cancel]);

  const next = () => {
    cancel();
    onNext();
  };

  const status =
    problem === "unsupported" ? "Ton navigateur ne sait pas écouter. Utilise Chrome, Edge ou Safari, ou passe ce mot."
    : problem === "denied" ? "Le micro est bloqué : autorise-le dans ton navigateur, puis réessaie."
    : phase === "speaking" ? "Écoute bien…"
    : phase === "listening" ? "Parle maintenant…"
    : phase === "success" ? "Bonne prononciation !"
    : phase === "fail" ? (heard ? `Entendu : « ${heard} »` : "Pas de réponse détectée")
    : "Prépare-toi…";

  const busy = phase === "speaking" || phase === "listening";

  return (
    <>
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-3 overflow-y-auto px-3 pb-4 sm:gap-4 sm:px-4">
        {/* Carte du mot */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center shadow-sm sm:p-6"
        >
          <h2 className="font-hanzi text-6xl font-black leading-none tracking-tight text-text sm:text-7xl md:text-8xl">
            {word.hanzi}
          </h2>
          <p className="mt-1 text-lg font-bold tracking-widest text-primary sm:text-xl">{word.pinyin}</p>
          <p className="mt-0.5 text-sm font-semibold text-text-muted sm:text-base">{word.french}</p>
          <ListenButtons text={word.hanzi} disabled={busy} />
        </motion.div>

        {/* Zone micro */}
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 sm:gap-3 sm:p-5">
          <PandaMascot state={PANDA[phase]} word={word.hanzi} />
          <p role="status" aria-live="polite"
            className={`text-center text-xs font-bold uppercase tracking-wider ${problem ? "text-warning" : "text-text-muted"}`}>
            {status}
          </p>
          {attempt > 0 && busy && (
            <p className="text-xs font-bold text-warning">Essai {attempt + 1} / {TRIES}</p>
          )}

          <MicButton phase={phase} onRetry={() => void run()} />

          <AnimatePresence>
            {phase === "success" && (
              <motion.p
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-lg bg-success-soft px-3 py-1.5 text-xs font-bold text-success"
              >
                Parfait ! Tu peux passer au mot suivant.
              </motion.p>
            )}
          </AnimatePresence>

          {phase === "fail" && (
            <div className="flex gap-2">
              <button type="button" onClick={() => void run()}
                className="flex items-center gap-1.5 rounded-lg bg-warning-soft px-3 py-2 text-xs font-bold text-warning transition active:scale-95">
                <RotateCcw size={13} aria-hidden="true" /> Réessayer
              </button>
              <button type="button" onClick={next}
                className="flex items-center gap-1.5 rounded-lg bg-tint px-3 py-2 text-xs font-bold text-text-muted transition hover:text-text active:scale-95">
                Passer <ChevronRight size={13} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        {/* Phrase d'exemple */}
        {word.example && (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <button
              type="button"
              onClick={() => setShowExample((s) => !s)}
              aria-expanded={showExample}
              className="flex w-full items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider text-text-muted transition hover:bg-tint sm:px-5 sm:py-3.5"
            >
              Voir la phrase d&apos;exemple
              <ChevronRight size={14} aria-hidden="true"
                className={`transition-transform duration-300 ${showExample ? "rotate-90" : ""}`} />
            </button>
            {showExample && (
              <div className="flex flex-col gap-1 border-t border-border px-4 pb-4 pt-3 sm:px-5">
                <p className="font-hanzi text-base font-bold text-text sm:text-lg">{word.example.hanzi}</p>
                <p className="text-sm font-semibold text-primary">{word.example.pinyin}</p>
                <p className="text-sm text-text-muted">{word.example.french}</p>
                <ListenButtons text={word.example.hanzi} disabled={busy} small />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pied : passer au mot suivant */}
      <div className="border-t border-border bg-card px-3 pb-5 pt-3 sm:px-4 sm:pb-6 sm:pt-4">
        <div className="mx-auto w-full max-w-2xl">
          <button
            type="button"
            onClick={next}
            disabled={phase === "listening"}
            className={`w-full rounded-xl py-3.5 text-sm font-bold shadow-sm transition active:scale-[0.98] sm:py-4 sm:text-base disabled:cursor-not-allowed disabled:bg-border disabled:text-text-muted ${
              phase === "success" ? "bg-success text-white hover:brightness-110" : "bg-secondary text-white hover:brightness-110"
            }`}
          >
            {phase === "success"
              ? isLast ? "Terminer le vocabulaire →" : "Mot suivant →"
              : isLast ? "Terminer quand même →" : "Passer ce mot →"}
          </button>
        </div>
      </div>
    </>
  );
}

function ListenButtons({ text, disabled, small = false }: { text: string; disabled: boolean; small?: boolean }) {
  const size = small ? 12 : 13;
  const base = `flex items-center gap-1.5 rounded-lg font-bold text-xs transition active:scale-95 disabled:opacity-50 ${small ? "px-3 py-1.5" : "px-3 py-2 sm:px-4"}`;
  return (
    <div className={`flex items-center gap-2 ${small ? "mt-2" : "mt-2 sm:mt-3"}`}>
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

function MicButton({ phase, onRetry }: { phase: Phase; onRetry: () => void }) {
  if (phase === "listening") {
    // Onde qui pulse pendant l'écoute (remplace l'animation Lottie téléchargée)
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
      aria-label={success ? "Mot réussi" : "Écouter et répéter de nouveau"}
      className={`flex h-14 w-14 items-center justify-center rounded-full text-white shadow-md transition sm:h-16 sm:w-16 ${
        success ? "cursor-default bg-success" : fail ? "bg-warning hover:brightness-110 active:scale-95" : "bg-primary hover:bg-primary-dark active:scale-95"
      }`}
    >
      {success ? <CheckCircle2 size={24} /> : fail ? <MicOff size={22} /> : <Mic size={22} />}
    </button>
  );
}
