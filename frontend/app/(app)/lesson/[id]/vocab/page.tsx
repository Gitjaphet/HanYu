// app/(app)/lesson/[id]/vocab/page.tsx — partie 1 : écouter chaque mot puis le répéter au micro
"use client";

import { useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, ChevronRight, Mic } from "lucide-react";
import { useLesson } from "@/hooks/useLessons";
import { useProgressStore } from "@/store/progressStore";
import { LessonLoading, LessonUnavailable } from "@/components/lesson/LessonState/LessonState";
import { QuitDialog } from "@/components/lesson/QuitDialog/QuitDialog";
import { NextFooter } from "@/components/lesson/NextFooter/NextFooter";
import { ListenButtons, RepeatPanel } from "@/components/lesson/RepeatPanel/RepeatPanel";
import { useRepeatAfterMe } from "@/hooks/useRepeatAfterMe";
import type { VocabItem } from "@/types";

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
  const repeat = useRepeatAfterMe(word.hanzi, paused);
  const [showExample, setShowExample] = useState(false);

  const next = () => {
    repeat.cancel();
    onNext();
  };

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
          <ListenButtons text={word.hanzi} disabled={repeat.busy} />
        </motion.div>

        <RepeatPanel repeat={repeat} hanzi={word.hanzi} successText="Parfait ! Tu peux passer au mot suivant." onSkip={next} />

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
                <ListenButtons text={word.example.hanzi} disabled={repeat.busy} small />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pied : passer au mot suivant */}
      <NextFooter phase={repeat.phase} onNext={next}
        label={repeat.phase === "success"
          ? isLast ? "Terminer le vocabulaire →" : "Mot suivant →"
          : isLast ? "Terminer quand même →" : "Passer ce mot →"} />
    </>
  );
}
