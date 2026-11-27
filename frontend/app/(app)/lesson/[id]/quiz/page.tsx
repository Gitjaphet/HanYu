// app/(app)/lesson/[id]/quiz/page.tsx — partie 3 : quiz final, 3 vies, étoiles et XP
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Heart, Star, Trophy, Volume2, X } from "lucide-react";
import { useLesson } from "@/hooks/useLessons";
import { useProgressStore } from "@/store/progressStore";
import { HEARTS, XP_PER_CORRECT, quizStars } from "@/lib/progress";
import { hasHanzi, prepareQuiz, questionHint, questionPrompt } from "@/lib/quiz";
import { speak, stopSpeaking } from "@/lib/speech";
import { LessonLoading, LessonUnavailable } from "@/components/lesson/LessonState/LessonState";
import { QuitDialog } from "@/components/lesson/QuitDialog/QuitDialog";
import PandaMascot from "@/components/lesson/PandaMascot/PandaMascot";
import type { Lesson, QuizQuestion } from "@/types";

type Result = { correct: number; wrong: number; total: number };

export default function QuizPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { lesson, loading, error } = useLesson(Number(params.id));
  const completeQuiz = useProgressStore((s) => s.completeQuiz);

  const [attempt, setAttempt] = useState(0); // chaque nouvel essai remonte le quiz : nouveau tirage, état à zéro
  const [result, setResult] = useState<Result | null>(null);

  const finish = useCallback((r: Result) => {
    if (!lesson) return;
    // Le serveur recalcule étoiles et XP à partir de ces faits : il ne croit pas un score tout fait
    completeQuiz(lesson.id, r);
    setResult(r);
  }, [lesson, completeQuiz]);

  if (loading) return <LessonLoading />;
  if (!lesson || (lesson.quiz?.length ?? 0) === 0) return <LessonUnavailable error={error} />;

  if (result) {
    return (
      <ResultScreen
        result={result}
        lessonTitle={lesson.title}
        onRetry={() => {
          setResult(null);
          setAttempt((a) => a + 1);
        }}
        onHome={() => router.push("/")}
      />
    );
  }

  return <QuizRun key={attempt} lesson={lesson} onFinish={finish} />;
}

// ── Une partie de quiz ──

function QuizRun({ lesson, onFinish }: { lesson: Lesson; onFinish: (r: Result) => void }) {
  const router = useRouter();
  // Tirage fait une seule fois, à la création du composant (pas d'effet, pas de second rendu)
  const [questions] = useState<QuizQuestion[]>(() => prepareQuiz(lesson.quiz));
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [confirmQuit, setConfirmQuit] = useState(false);

  const hearts = HEARTS - wrong;
  const isLast = idx === questions.length - 1;
  const over = isLast || hearts <= 0;

  const answered = useCallback((ok: boolean) => {
    if (ok) setCorrect((c) => c + 1);
    else setWrong((w) => w + 1);
  }, []);

  const next = () => {
    if (over) onFinish({ correct, wrong, total: questions.length });
    else setIdx((i) => i + 1);
  };

  const stay = useCallback(() => setConfirmQuit(false), []);

  return (
    <div className="fixed inset-0 z-[90] flex h-[100dvh] flex-col bg-background select-none">
      {confirmQuit && (
        <QuitDialog title="Quitter le quiz ?" message="Tes réponses à ce quiz ne seront pas enregistrées."
          onStay={stay} onQuit={() => router.push("/")} />
      )}

      {/* En-tête : retour au dialogue, progression, vies, quitter */}
      <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3">
        <button type="button" onClick={() => router.push(`/lesson/${lesson.id}/dialogue`)}
          aria-label="Revenir au dialogue" title="Revenir au dialogue"
          className="-ml-2 flex min-h-11 min-w-11 items-center justify-center rounded-lg text-text-muted transition hover:bg-tint hover:text-text">
          <ChevronLeft size={20} />
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-border sm:h-2.5" role="progressbar"
          aria-valuenow={idx} aria-valuemin={0} aria-valuemax={questions.length} aria-label="Progression">
          <div className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${(idx / questions.length) * 100}%` }} />
        </div>
        <Hearts left={hearts} />
        <button type="button" onClick={() => setConfirmQuit(true)} aria-label="Quitter le quiz" title="Quitter le quiz"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-text-muted transition hover:bg-tint hover:text-text">
          <X size={20} />
        </button>
      </div>

      <div className="mx-auto mb-1 w-full max-w-2xl px-3 sm:mb-2 sm:px-4">
        <span className="block truncate text-[10px] font-bold uppercase tracking-widest text-primary">
          Partie 3 · Quiz final — {lesson.title}
        </span>
      </div>

      <QuestionStep
        key={idx}
        question={questions[idx]}
        number={idx + 1}
        total={questions.length}
        finishing={over}
        paused={confirmQuit}
        onAnswer={answered}
        onNext={next}
      />
    </div>
  );
}

function Hearts({ left }: { left: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${left} vie${left > 1 ? "s" : ""} restante${left > 1 ? "s" : ""}`}>
      {Array.from({ length: HEARTS }, (_, i) => (
        <Heart key={i} size={16} aria-hidden="true"
          className={`transition-all duration-300 ${i < left ? "fill-danger text-danger" : "text-border"}`} />
      ))}
    </div>
  );
}

// ── Une question ──

type Answer = "idle" | "correct" | "wrong";

function QuestionStep({ question, number, total, finishing, paused, onAnswer, onNext }: {
  question: QuizQuestion;
  number: number;
  total: number;
  finishing: boolean;  // après cette question : écran de résultats
  paused: boolean;     // fenêtre « Quitter ? » ouverte : le clavier ne répond plus
  onAnswer: (correct: boolean) => void;
  onNext: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [answer, setAnswer] = useState<Answer>("idle");
  const isAudio = question.type === "audio";

  const verify = useCallback(() => {
    if (!selected || answer !== "idle") return;
    const ok = selected === question.answer;
    setAnswer(ok ? "correct" : "wrong");
    onAnswer(ok);
  }, [selected, answer, question.answer, onAnswer]);

  // Question audio : le mot est prononcé dès l'affichage
  useEffect(() => {
    if (!isAudio) return;
    const timer = setTimeout(() => void speak(question.hanzi), 400);
    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
  }, [isAudio, question.hanzi]);

  // Clavier (ordinateur) : 1 à 4 pour choisir, Entrée pour vérifier puis continuer
  useEffect(() => {
    if (paused) return;
    const onKey = (event: KeyboardEvent) => {
      const choice = question.options[Number(event.key) - 1];
      if (choice && answer === "idle") setSelected(choice);
      else if (event.key === "Enter") {
        event.preventDefault();
        if (answer === "idle") verify();
        else onNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paused, question.options, answer, verify, onNext]);

  const hint = questionHint(question);

  return (
    <>
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-3 overflow-y-auto px-3 pb-4 sm:gap-5 sm:px-4">
        {/* Carte question */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
          className="rounded-2xl border border-border bg-card px-4 py-4 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                Question {number} / {total}
              </span>
              <p className="mt-0.5 text-base font-bold leading-snug text-text sm:mt-1 sm:text-lg">{questionPrompt(question)}</p>
              {hint && <p className="text-sm font-semibold text-primary">{hint}</p>}
              {isAudio && (
                <button type="button" onClick={() => void speak(question.hanzi)}
                  className="mt-2 flex w-fit items-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-bold text-primary transition hover:bg-primary/20 active:scale-95">
                  <Volume2 size={16} aria-hidden="true" /> Réécouter
                </button>
              )}
            </div>
            <div className="shrink-0 origin-right scale-75 sm:scale-90 md:scale-100">
              <PandaMascot state={answer === "correct" ? "success" : answer === "wrong" ? "fail" : "idle"} />
            </div>
          </div>
        </motion.div>

        {/* Réponses */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3" role="radiogroup" aria-label="Réponses">
          {question.options.map((option, i) => {
            const isSelected = selected === option;
            const isRight = answer !== "idle" && option === question.answer;
            const isWrong = answer === "wrong" && isSelected;
            const tone = isRight
              ? "border-success bg-success-soft text-success"
              : isWrong
                ? "border-danger bg-danger-soft text-danger"
                : isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-text hover:border-primary/50 active:scale-[0.98]";
            return (
              <motion.button
                key={option}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={answer !== "idle"}
                onClick={() => setSelected(option)}
                animate={isWrong ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
                className={`flex min-h-14 w-full items-center justify-between gap-2 rounded-xl border-2 px-4 py-3 text-left font-bold transition-colors sm:px-5 ${tone} ${answer !== "idle" ? "cursor-default" : ""}`}
              >
                <span className="flex items-center gap-3">
                  <span className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-md bg-background text-[11px] text-text-muted sm:flex">
                    {i + 1}
                  </span>
                  <span className={hasHanzi(option) ? "font-hanzi text-xl" : "text-sm"}>{option}</span>
                </span>
                {isRight && <CheckCircle2 size={18} className="shrink-0" aria-hidden="true" />}
                {isWrong && <AlertCircle size={18} className="shrink-0" aria-hidden="true" />}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Pied : résultat de la réponse + Vérifier / Continuer */}
      <div className={`border-t px-3 pb-[max(env(safe-area-inset-bottom),1.25rem)] pt-3 transition-colors duration-300 sm:px-4 sm:pb-6 sm:pt-4 ${
        answer === "correct" ? "border-success/30 bg-success-soft" : answer === "wrong" ? "border-danger/30 bg-danger-soft" : "border-border bg-card"}`}>
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0" role="status" aria-live="polite">
            {answer === "correct" && (
              <div className="flex items-center gap-2 text-success sm:gap-3">
                <CheckCircle2 size={22} className="hidden shrink-0 sm:block" aria-hidden="true" />
                <div>
                  <p className="text-sm font-bold">Excellent !</p>
                  <p className="text-xs font-semibold">+{XP_PER_CORRECT} XP</p>
                </div>
              </div>
            )}
            {answer === "wrong" && (
              <div className="flex items-center gap-2 text-danger sm:gap-3">
                <AlertCircle size={22} className="hidden shrink-0 sm:block" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-bold">Pas tout à fait…</p>
                  <p className="truncate text-xs font-semibold">Réponse : {question.answer}</p>
                </div>
              </div>
            )}
            {answer === "idle" && <div className="h-10" />}
          </div>

          {answer === "idle" ? (
            <button type="button" disabled={!selected} onClick={verify}
              className="whitespace-nowrap rounded-xl bg-secondary px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:bg-border disabled:text-text-muted sm:px-8 sm:py-4">
              Vérifier
            </button>
          ) : (
            <button type="button" onClick={onNext} autoFocus
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:brightness-110 active:scale-95 sm:gap-2 sm:px-8 sm:py-4 ${
                answer === "correct" ? "bg-success" : "bg-danger"}`}>
              {finishing ? "Voir les résultats" : "Continuer"}
              <ChevronRight size={15} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ── Écran de fin ──

function ResultScreen({ result, lessonTitle, onRetry, onHome }: {
  result: Result;
  lessonTitle: string;
  onRetry: () => void;
  onHome: () => void;
}) {
  const failed = result.wrong >= HEARTS;
  const perfect = result.correct === result.total;
  const stars = quizStars(result.correct, result.total, failed);
  const tone = failed ? "bg-danger-soft text-danger" : perfect ? "bg-warning-soft text-warning" : "bg-success-soft text-success";

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 overflow-y-auto bg-background px-4 py-8 text-center sm:gap-6 sm:px-6">
      <div className="sm:scale-125 md:scale-150">
        <PandaMascot state={failed ? "fail" : "success"} />
      </div>

      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.5 }}
        className={`flex h-16 w-16 items-center justify-center rounded-full shadow-lg sm:h-20 sm:w-20 ${tone}`}>
        {failed ? <AlertCircle className="h-9 w-9 sm:h-11 sm:w-11" /> : <Trophy className="h-9 w-9 sm:h-11 sm:w-11" />}
      </motion.div>

      <div>
        <h2 className="mb-1 text-2xl font-black text-text sm:mb-2 sm:text-3xl">
          {failed ? "Plus de vies !" : perfect ? "Quiz parfait !" : "Leçon terminée !"}
        </h2>
        <p className="mx-auto max-w-xs text-sm font-medium text-text-muted sm:text-base">
          {failed ? "Ne baisse pas les bras : relis le vocabulaire et retente ta chance." : `Tu as validé : ${lessonTitle}`}
        </p>
      </div>

      {!failed && (
        <div className="flex items-center gap-1.5 sm:gap-2" aria-label={`${stars} étoile${stars > 1 ? "s" : ""} sur 3`}>
          {[1, 2, 3].map((s) => (
            <motion.span key={s} initial={{ scale: 0 }} animate={{ scale: s <= stars ? 1.1 : 0.9 }}
              transition={{ delay: 0.2 + s * 0.15, type: "spring" }}>
              <Star aria-hidden="true"
                className={`h-9 w-9 sm:h-10 sm:w-10 ${s <= stars ? "fill-warning text-warning" : "text-border"}`} />
            </motion.span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        <Stat value={`${result.correct}/${result.total}`} label="Bonnes réponses" />
        <Stat value={`+${result.correct * XP_PER_CORRECT} XP`} label="Gagnés" accent />
        <Stat value={`${Math.max(0, HEARTS - result.wrong)}/${HEARTS}`} label="Vies restantes" />
      </div>

      <div className="flex w-full max-w-xs flex-col gap-2 sm:gap-3">
        {failed && (
          <button type="button" onClick={onRetry}
            className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark active:scale-[0.98] sm:py-4 sm:text-base">
            Réessayer le quiz
          </button>
        )}
        <button type="button" onClick={onHome}
          className={`w-full rounded-xl py-3.5 text-sm font-bold shadow-sm transition active:scale-[0.98] sm:py-4 sm:text-base ${
            failed ? "border border-border bg-card text-text-muted hover:bg-tint" : "bg-success text-white hover:brightness-110"}`}>
          Retour au tableau de bord
        </button>
      </div>
    </div>
  );
}

function Stat({ value, label, accent = false }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-2.5 text-center sm:px-5 sm:py-3">
      <p className={`text-xl font-black sm:text-2xl ${accent ? "text-primary" : "text-text"}`}>{value}</p>
      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-text-muted sm:text-xs">{label}</p>
    </div>
  );
}
