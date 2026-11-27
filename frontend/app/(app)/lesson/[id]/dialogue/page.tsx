// app/(app)/lesson/[id]/dialogue/page.tsx — partie 2 : écouter tout le dialogue, puis répéter chaque réplique
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, MessageSquare, Volume2 } from "lucide-react";
import { useLesson } from "@/hooks/useLessons";
import { useRepeatAfterMe } from "@/hooks/useRepeatAfterMe";
import { useProgressStore } from "@/store/progressStore";
import { LessonLoading, LessonUnavailable } from "@/components/lesson/LessonState/LessonState";
import { NextFooter } from "@/components/lesson/NextFooter/NextFooter";
import PandaMascot from "@/components/lesson/PandaMascot/PandaMascot";
import { ListenButtons, RepeatPanel } from "@/components/lesson/RepeatPanel/RepeatPanel";
import { speak, speakSequence, stopSpeaking } from "@/lib/speech";
import type { DialogueLine } from "@/types";

type Step = "discovery" | "practice";

// Deux personnages, deux couleurs du thème (lisibles en clair comme en sombre)
const SPEAKER = {
  A: { bubble: "bg-tint border-primary/25 rounded-tl-none", accent: "text-primary", align: "items-start", justify: "justify-start" },
  B: { bubble: "bg-tertiary/10 border-tertiary/30 rounded-tr-none", accent: "text-tertiary", align: "items-end", justify: "justify-end" },
} as const;
const speakerStyle = (speaker: string) => (speaker === "B" ? SPEAKER.B : SPEAKER.A);

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function DialoguePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { lesson, loading, error } = useLesson(Number(params.id));
  const completeDialogue = useProgressStore((s) => s.completeDialogue);

  const [step, setStep] = useState<Step>("discovery");
  const [lineIdx, setLineIdx] = useState(0);

  const lines: DialogueLine[] = lesson?.dialogue ?? [];

  const goNextLine = useCallback(() => {
    if (!lesson) return;
    if (lineIdx < lines.length - 1) {
      setLineIdx((i) => i + 1);
    } else {
      completeDialogue(lesson.id);
      router.push(`/lesson/${lesson.id}/quiz`);
    }
  }, [lineIdx, lines.length, lesson, completeDialogue, router]);

  if (loading) return <LessonLoading />;
  if (!lesson || lines.length === 0) return <LessonUnavailable error={error} />;

  const progress = step === "discovery" ? 0 : 50 + (lineIdx / lines.length) * 50;

  return (
    <div className="fixed inset-0 z-[90] flex h-[100dvh] flex-col bg-background select-none">
      {step === "discovery" ? (
        <Discovery
          lines={lines}
          title={lesson.title}
          onBack={() => router.push(`/lesson/${lesson.id}/vocab`)}
          onDone={() => setStep("practice")}
        />
      ) : (
        <>
          <Header
            progress={progress}
            backLabel="Réécouter le dialogue"
            onBack={() => {
              stopSpeaking();
              setLineIdx(0);
              setStep("discovery");
            }}
            forwardLabel="Aller au quiz"
            onForward={() => {
              stopSpeaking();
              router.push(`/lesson/${lesson.id}/quiz`);
            }}
            counter={`${lineIdx + 1} / ${lines.length}`}
          />
          <PartLabel text={`Partie 2 · Répète chaque réplique — ${lesson.title}`} />
          <LineStep
            key={lineIdx}
            line={lines[lineIdx]}
            previous={lines.slice(Math.max(0, lineIdx - 2), lineIdx)}
            isLast={lineIdx === lines.length - 1}
            onNext={goNextLine}
          />
        </>
      )}
    </div>
  );
}

// ── Découverte : le panda lit tout le dialogue, réplique par réplique ──

function Discovery({ lines, title, onBack, onDone }: {
  lines: DialogueLine[];
  title: string;
  onBack: () => void;
  onDone: () => void;
}) {
  const [active, setActive] = useState(-1); // réplique en cours de lecture (-1 : introduction)
  const [speaking, setSpeaking] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await wait(400);
      if (cancelled) return;
      setSpeaking(true);
      await speakSequence([{ text: "Écoute bien ce dialogue.", lang: "fr-FR", rate: 1 }]);
      for (let i = 0; i < lines.length; i++) {
        if (cancelled) return;
        setActive(i);
        await speakSequence([
          { text: `Personnage ${lines[i].speaker} :`, lang: "fr-FR", rate: 1 },
          { text: lines[i].hanzi },
        ]);
        if (cancelled) return;
        await wait(700);
      }
      if (cancelled) return;
      setSpeaking(false);
      setDone(true);
    })();
    return () => {
      cancelled = true;
      stopSpeaking();
    };
  }, [lines]);

  const skip = () => {
    stopSpeaking();
    onDone();
  };

  return (
    <>
      <Header
        progress={done ? 50 : (Math.max(active, 0) / lines.length) * 50}
        backLabel="Revenir au vocabulaire"
        onBack={() => {
          stopSpeaking();
          onBack();
        }}
        forwardLabel={done ? "Passer à la répétition" : undefined}
        onForward={done ? skip : undefined}
        counter="Dialogue"
      />
      <PartLabel text={`Partie 2 · Écoute d'abord — ${title}`} />

      <div className="mx-auto mb-1 flex w-full max-w-2xl justify-center px-3 sm:mb-2 sm:px-4">
        <div className="origin-top scale-75 sm:scale-90 md:scale-100">
          <PandaMascot state={done ? "success" : speaking ? "speaking" : "idle"} word={done ? undefined : lines[active]?.hanzi} />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-2 overflow-y-auto px-3 pb-4 sm:gap-3 sm:px-4">
        {lines.map((line, i) => {
          const style = speakerStyle(line.speaker);
          const heardAlready = done || i <= active;
          return (
            <div key={line.id}
              className={`flex flex-col gap-0.5 transition-all duration-300 sm:gap-1 ${style.align} ${heardAlready ? "opacity-100" : "opacity-30"}`}>
              <span className={`px-1 text-[10px] font-bold uppercase tracking-wider ${style.accent}`}>
                Personnage {line.speaker}
              </span>
              <div className={`max-w-[90%] rounded-2xl border-2 px-3 py-2.5 transition-all duration-300 sm:max-w-[85%] sm:px-4 sm:py-3 ${style.bubble} ${
                i === active && !done ? "scale-[1.02] shadow-md" : ""}`}>
                <p className="font-hanzi text-xl font-black leading-snug text-text sm:text-2xl">{line.hanzi}</p>
                <p className={`mt-0.5 text-xs font-semibold sm:mt-1 sm:text-sm ${style.accent}`}>{line.pinyin}</p>
                <p className="mt-0.5 text-[11px] text-text-muted sm:text-xs">{line.french}</p>
                {done && (
                  <button type="button" onClick={() => void speak(line.hanzi)}
                    className="mt-1.5 flex min-h-9 items-center gap-1 text-[11px] font-bold text-text-muted transition hover:text-text sm:mt-2">
                    <Volume2 size={12} aria-hidden="true" /> Réécouter
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-border bg-card px-3 pb-[max(env(safe-area-inset-bottom),1.25rem)] pt-3 sm:px-4 sm:pb-6 sm:pt-4">
        <div className="mx-auto w-full max-w-2xl">
          <button
            type="button"
            onClick={skip}
            disabled={!done}
            className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-border disabled:text-text-muted sm:py-4 sm:text-base"
          >
            {done ? "C'est parti, à toi de répéter ! →" : "Écoute le dialogue…"}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Répétition : une réplique à la fois, au micro ──

function LineStep({ line, previous, isLast, onNext }: {
  line: DialogueLine;
  previous: DialogueLine[];
  isLast: boolean;
  onNext: () => void;
}) {
  const repeat = useRepeatAfterMe(line.hanzi);
  const style = speakerStyle(line.speaker);

  const next = () => {
    repeat.cancel();
    onNext();
  };

  return (
    <>
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-start gap-3 overflow-y-auto px-3 pb-4 sm:justify-center sm:gap-4 sm:px-4">
        {/* Les deux répliques précédentes, en rappel */}
        {previous.length > 0 && (
          <div className="flex flex-col gap-1.5 opacity-50 sm:gap-2">
            {previous.map((p) => {
              const ps = speakerStyle(p.speaker);
              return (
                <div key={p.id} className={`flex ${ps.justify}`}>
                  <div className={`max-w-[80%] rounded-xl border px-3 py-1.5 sm:max-w-[75%] sm:py-2 ${ps.bubble}`}>
                    <p className="font-hanzi text-sm font-bold text-text sm:text-base">{p.hanzi}</p>
                    <p className="text-[10px] text-text-muted sm:text-xs">{p.french}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Réplique à répéter */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className={`flex ${style.justify}`}>
          <div className={`max-w-[92%] rounded-2xl border-2 px-4 py-3 shadow-md sm:max-w-[85%] sm:px-5 sm:py-4 ${style.bubble}`}>
            <div className="mb-1.5 flex items-center gap-1.5 sm:mb-2">
              <MessageSquare size={11} className={style.accent} aria-hidden="true" />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${style.accent}`}>Personnage {line.speaker}</span>
            </div>
            <p className="font-hanzi text-3xl font-black leading-tight text-text sm:text-4xl md:text-5xl">{line.hanzi}</p>
            <p className={`mt-1 text-sm font-bold sm:text-base ${style.accent}`}>{line.pinyin}</p>
            <p className="mt-0.5 text-xs text-text-muted sm:text-sm">{line.french}</p>
            <ListenButtons text={line.hanzi} disabled={repeat.busy} small />
          </div>
        </motion.div>

        <RepeatPanel repeat={repeat} hanzi={line.hanzi} successText="Parfait ! Réplique suivante." onSkip={next} />
      </div>

      <NextFooter phase={repeat.phase} onNext={next}
        label={repeat.phase === "success"
          ? isLast ? "Terminer le dialogue →" : "Réplique suivante →"
          : isLast ? "Terminer quand même →" : "Passer cette réplique →"} />
    </>
  );
}

// ── En-tête et libellé communs aux deux étapes ──

function Header({ progress, backLabel, onBack, forwardLabel, onForward, counter }: {
  progress: number;
  backLabel: string;
  onBack: () => void;
  forwardLabel?: string;
  onForward?: () => void;
  counter: string;
}) {
  const nav = "flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 text-text-muted transition hover:bg-tint hover:text-text";
  return (
    <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3">
      <button type="button" onClick={onBack} aria-label={backLabel} title={backLabel} className={`-ml-2 ${nav}`}>
        <ChevronLeft size={20} />
      </button>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-border sm:h-2.5" role="progressbar"
        aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Progression">
        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <span className="whitespace-nowrap text-[11px] font-bold text-text-muted tabular-nums sm:text-xs">{counter}</span>
      {onForward && (
        <button type="button" onClick={onForward} aria-label={forwardLabel} title={forwardLabel} className={nav}>
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
}

function PartLabel({ text }: { text: string }) {
  return (
    <div className="mx-auto mb-1 w-full max-w-2xl px-3 sm:mb-2 sm:px-4">
      <span className="block truncate text-[10px] font-bold uppercase tracking-widest text-primary">{text}</span>
    </div>
  );
}
