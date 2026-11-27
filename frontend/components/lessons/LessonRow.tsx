import Link from "next/link";
import { Check, ChevronRight, Lock, Play, Star } from "lucide-react";
import type { Lesson, LessonProgress, LessonStatus } from "@/types";

const STEPS = [
  { key: "vocabDone", label: "Vocab" },
  { key: "dialogueDone", label: "Dialogue" },
  { key: "quizDone", label: "Quiz" },
] as const;

function Stars({ count }: { count: number }) {
  return (
    <span className="flex" aria-label={`${count} étoile${count > 1 ? "s" : ""} sur 3`}>
      {[0, 1, 2].map((i) => (
        <Star
          key={i}
          size={15}
          aria-hidden="true"
          className={i < count ? "fill-warning text-warning" : "text-border"}
        />
      ))}
    </span>
  );
}

function StatusBadge({ status, number }: { status: LessonStatus; number: number }) {
  if (status === "completed")
    return (
      <span className="w-8 h-8 shrink-0 rounded-full bg-tertiary text-white flex items-center justify-center">
        <Check size={16} strokeWidth={3} aria-hidden="true" />
      </span>
    );
  if (status === "locked")
    return (
      <span className="w-8 h-8 shrink-0 rounded-full bg-background text-text-muted flex items-center justify-center">
        <Lock size={15} aria-hidden="true" />
      </span>
    );
  return (
    <span className="w-8 h-8 shrink-0 rounded-full bg-primary text-white flex items-center justify-center text-sm font-extrabold">
      {number}
    </span>
  );
}

type Props = {
  lesson: Lesson;
  number: number;
  status: LessonStatus;
  progress?: LessonProgress;
  current: boolean;
};

/** Une leçon du programme : une ligne cliquable (sauf si verrouillée). */
export function LessonRow({ lesson, number, status, progress, current }: Props) {
  const locked = status === "locked";
  const statusText = { completed: "Terminée", "in-progress": "En cours", available: "Disponible", locked: "Verrouillée" }[status];

  const content = (
    <>
      <StatusBadge status={status} number={number} />

      <span className={`flex-1 min-w-0 flex items-center gap-3 md:gap-4 ${locked ? "opacity-60" : ""}`}>
        <span className="hidden sm:flex w-14 h-14 shrink-0 rounded-2xl bg-background items-center justify-center font-hanzi text-2xl text-text">
          {lesson.chinese}
        </span>
        <span className="sm:hidden font-hanzi text-2xl text-text shrink-0">{lesson.chinese}</span>
        <span className="min-w-0 flex flex-col">
          <span className="font-extrabold text-[15px] text-text truncate">
            <span className="hidden md:inline">Leçon {number} · </span>
            {lesson.title}
          </span>
          <span className="text-[13px] font-semibold text-text-muted truncate">
            {lesson.pinyin}
            <span className="sr-only"> — {statusText}</span>
          </span>
        </span>
      </span>

      {/* Étapes de la leçon (grand écran) */}
      {!locked && (
        <span className="hidden lg:flex gap-1.5">
          {STEPS.map((step) => {
            const ok = Boolean(progress?.[step.key]);
            return (
              <span
                key={step.key}
                className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${
                  ok ? "bg-tertiary/15 text-tertiary" : "bg-background text-text-muted"
                }`}
              >
                {step.label}
                <span className="sr-only">{ok ? " terminé" : " à faire"}</span>
              </span>
            );
          })}
        </span>
      )}

      <span className="hidden md:flex w-[64px] justify-end">
        {status === "completed" && <Stars count={progress?.stars ?? 0} />}
      </span>

      {/* Action */}
      <span className="flex justify-end md:w-[128px]">
        {status === "completed" && (
          <>
            <span className="md:hidden"><Stars count={progress?.stars ?? 0} /></span>
            <span className="hidden md:inline-flex rounded-full px-5 py-2.5 text-sm font-extrabold text-primary ring-[1.5px] ring-inset ring-primary/35">
              Revoir
            </span>
          </>
        )}
        {(status === "available" || status === "in-progress") && (
          <>
            <ChevronRight size={20} className="md:hidden text-primary" aria-hidden="true" />
            <span className="hidden md:inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-white">
              <Play size={13} className="fill-current" aria-hidden="true" />
              {status === "in-progress" ? "Continuer" : "Commencer"}
            </span>
          </>
        )}
      </span>
    </>
  );

  const base = "flex items-center gap-3 md:gap-4 px-3.5 py-3 md:px-5 md:py-3.5";

  if (locked) return <div className={base}>{content}</div>;

  return (
    <Link
      href={`/lesson/${lesson.id}`}
      aria-current={current ? "step" : undefined}
      className={`${base} transition-[background-color,transform] duration-200 hover:bg-background/70 active:scale-[0.99] ${
        current ? "rounded-2xl ring-2 ring-inset ring-primary" : ""
      }`}
    >
      {content}
    </Link>
  );
}
