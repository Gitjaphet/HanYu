// app/(app)/lesson/[id]/quiz/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { useLesson } from "@/hooks/useLessons";
import { useProgressStore } from "@/store/progressStore";
import { quizStars } from "@/lib/progress";
import { LessonLoading, LessonUnavailable } from "@/components/lesson/LessonState/LessonState";
import { QuizQuestion } from "@/types";
import { X, CheckCircle2, AlertCircle, ChevronRight, Trophy, ChevronLeft } from "lucide-react";
import PandaMascot, { PandaState } from "@/components/lesson/PandaMascot/PandaMascot";

// ─── Constantes ───────────────────────────────────────────────────────────────
const XP_PER_CORRECT = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getQuestionPrompt(q: QuizQuestion): string {
  switch (q.type) {
    case "hanzi-to-french": return `Que signifie ${q.hanzi} ?`;
    case "french-to-hanzi": return `Comment écrit-on "${q.french}" ?`;
    case "pinyin-to-hanzi": return `Quel hanzi correspond à "${q.pinyin}" ?`;
    case "audio":           return "Que signifie ce mot ?";
    default:                return q.hanzi;
  }
}

function getQuestionSubtitle(q: QuizQuestion): string {
  switch (q.type) {
    case "hanzi-to-french": return q.pinyin;
    case "french-to-hanzi": return q.pinyin;
    default:                return "";
  }
}

type AnswerState = "idle" | "correct" | "wrong";

export default function QuizPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { lesson, loading, error } = useLesson(Number(params.id));
  const completeQuiz = useProgressStore((s) => s.completeQuiz);

  const [questions, setQuestions] = useState<QuizQuestion[]>(lesson?.quiz ?? []);

  useEffect(() => {
    setQuestions(shuffleArray(lesson?.quiz ?? []));
  }, [lesson?.quiz]);

  const [idx, setIdx]               = useState(0);
  const [selected, setSelected]     = useState<string | null>(null);
  const [answerState, setAnswer]    = useState<AnswerState>("idle");
  const [score, setScore]           = useState(0);
  const [xp, setXp]                 = useState(0);
  const [hearts, setHearts]         = useState(3);
  const [isFinished, setIsFinished] = useState(false);

  // ── Panda ──
  const [pandaState, setPandaState] = useState<PandaState>("idle");

  const current  = questions[idx];
  const progress = questions.length > 0 ? (idx / questions.length) * 100 : 0;
  const isLast   = idx === questions.length - 1;

  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  useEffect(() => {
    if (current) setShuffledOptions(shuffleArray(current.options));
  }, [current]);

  useEffect(() => {
    setPandaState("idle");
  }, [idx]);

  // ─── Vérification ─────────────────────────────────────────────────────────
  const verify = useCallback(() => {
    if (!selected || !current || answerState !== "idle") return;
    const correct = selected === current.answer;
    setAnswer(correct ? "correct" : "wrong");
    setPandaState(correct ? "success" : "fail");
    if (correct) {
      setScore((s) => s + 1);
      setXp((x) => x + XP_PER_CORRECT);
    } else {
      setHearts((h) => Math.max(0, h - 1));
    }
  }, [selected, current, answerState]);

  // ─── Question suivante ─────────────────────────────────────────────────────
  const goNext = useCallback(() => {
    if (isLast || hearts <= 0) {
      setIsFinished(true);
      return;
    }
    setSelected(null);
    setAnswer("idle");
    setPandaState("idle");
    setIdx((i) => i + 1);
  }, [isLast, hearts]);

  // ─── Sauvegarde ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isFinished || !lesson) return;
    completeQuiz(lesson.id, { stars: quizStars(score, questions.length, hearts <= 0), xp });
  }, [isFinished, lesson, score, questions.length, hearts, xp, completeQuiz]);

  // ─── Garde ────────────────────────────────────────────────────────────────
  if (loading) return <LessonLoading />;
  if (!lesson || questions.length === 0) {
    return <LessonUnavailable error={error} />;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ── ÉCRAN DE FIN ──────────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  if (isFinished) {
    const stars   = quizStars(score, questions.length, hearts <= 0);
    const perfect = score === questions.length;
    const failed  = hearts <= 0;

    return (
      <div className="fixed inset-0 bg-background z-[100] flex flex-col items-center justify-center
                      px-4 sm:px-6 py-8 text-center gap-4 sm:gap-6 overflow-y-auto">

        {/* Panda résultat — taille adaptée mobile */}
        <div className="scale-100 sm:scale-125 md:scale-150 mb-0 sm:mb-2">
          <PandaMascot state={failed ? "fail" : "success"} />
        </div>

        {/* Icône trophée — légèrement réduite sur mobile */}
        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-lg
          ${failed ? "bg-red-100" : perfect ? "bg-yellow-100" : "bg-green-100"}`}>
          {failed
            ? <AlertCircle size={34} className="text-red-500 sm:hidden" />
            : <Trophy      size={34} className={`sm:hidden ${perfect ? "text-yellow-500" : "text-green-500"}`} />
          }
          {failed
            ? <AlertCircle size={42} className="text-red-500 hidden sm:block" />
            : <Trophy      size={42} className={`hidden sm:block ${perfect ? "text-yellow-500" : "text-green-500"}`} />
          }
        </div>

        {/* Titre */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-text mb-1 sm:mb-2">
            {failed  ? "Plus de vies ! 💔"  :
             perfect ? "Quiz Parfait ! 🎉"   :
                       "Leçon Terminée ! ✅"}
          </h2>
          <p className="text-sm sm:text-base text-text-muted font-medium max-w-xs mx-auto">
            {failed
              ? "Ne baisse pas les bras, tu peux retenter !"
              : `Tu as validé : ${lesson.title}`}
          </p>
        </div>

        {/* Étoiles */}
        {!failed && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`text-3xl sm:text-4xl transition-all duration-300
                  ${s <= stars ? "opacity-100 scale-110" : "opacity-20 scale-90"}`}
              >
                ⭐
              </span>
            ))}
          </div>
        )}

        {/* Stats — taille de police et padding réduits sur mobile */}
        <div className="flex gap-2 sm:gap-3 flex-wrap justify-center">
          <div className="bg-card border border-border rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 text-center">
            <p className="text-xl sm:text-2xl font-black text-text">{score}/{questions.length}</p>
            <p className="text-[10px] sm:text-xs font-bold text-text-muted uppercase tracking-wider mt-0.5">
              Bonnes rép.
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 text-center">
            <p className="text-xl sm:text-2xl font-black text-primary">+{xp} XP</p>
            <p className="text-[10px] sm:text-xs font-bold text-text-muted uppercase tracking-wider mt-0.5">
              Gagnés
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 text-center">
            <p className="text-xl sm:text-2xl font-black text-red-500">
              {"❤️".repeat(Math.max(0, hearts))}{hearts === 0 ? "💔" : ""}
            </p>
            <p className="text-[10px] sm:text-xs font-bold text-text-muted uppercase tracking-wider mt-0.5">
              Vies rest.
            </p>
          </div>
        </div>

        {/* Boutons — pleine largeur, zone de tap généreuse */}
        <div className="flex flex-col gap-2 sm:gap-3 w-full max-w-xs">
          {failed && (
            <button
              onClick={() => {
                setIdx(0);
                setSelected(null);
                setAnswer("idle");
                setScore(0);
                setXp(0);
                setHearts(3);
                setIsFinished(false);
                setPandaState("idle");
              }}
              className="w-full py-3.5 sm:py-4 rounded-xl bg-primary text-white font-bold text-sm sm:text-base shadow-sm hover:opacity-90 active:scale-[0.98] transition"
            >
              Réessayer le quiz
            </button>
          )}
          <button
            onClick={() => router.push("/")}
            className={`w-full py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base shadow-sm active:scale-[0.98] transition
              ${failed
                ? "bg-card border border-border text-text-muted hover:bg-border/50"
                : "bg-green-600 text-white hover:bg-green-700"
              }`}
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ── ÉCRAN QUIZ ─────────────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 bg-background z-[90] flex flex-col h-[100dvh] select-none">

      {/* ── HEADER ── */}
      <div className="max-w-2xl w-full mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-3 sm:gap-4">
        
        {/* ← Retour vers la page dialogue */}
        <button
          onClick={() => router.push(`/lesson/${lesson.id}/dialogue`)}
          className="text-text-muted hover:text-text transition p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Barre de progression */}
        <div className="flex-1 h-2 sm:h-2.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Vies (Cœurs) */}
        <div className="flex items-center gap-0.5 whitespace-nowrap">
          {[1, 2, 3].map((h) => (
            <span
              key={h}
              className={`text-[11px] sm:text-xs transition-all duration-300 ${h <= hearts ? "opacity-100" : "opacity-20 grayscale"}`}
            >
              ❤️
            </span>
          ))}
        </div>

        {/* X Fermer / Retour au dashboard */}
        <button
          onClick={() => router.push("/")}
          className="text-text-muted hover:text-text transition p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <X size={20} />
        </button>
      </div>

      {/* Label */}
      <div className="max-w-2xl w-full mx-auto px-3 sm:px-4 mb-1 sm:mb-2">
        <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-primary/70">
          <span className="hidden sm:inline">Partie 3 · Quiz final — {lesson.title}</span>
          <span className="inline sm:hidden">
            Quiz — {lesson.title.length > 20 ? lesson.title.slice(0, 20) + "…" : lesson.title}
          </span>
        </span>
      </div>

      {/* ── ZONE CENTRALE ── */}
      <div className="flex-1 max-w-2xl w-full mx-auto px-3 sm:px-4 flex flex-col justify-center gap-3 sm:gap-5 overflow-y-auto pb-4">

        {/* Carte question + Panda */}
        <div className="bg-card border border-border rounded-2xl px-4 py-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 sm:gap-4">

            {/* Texte question */}
            <div className="flex flex-col gap-0.5 sm:gap-1 flex-1 min-w-0">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-text-muted">
                Question {idx + 1} / {questions.length}
              </span>
              <p className="text-base sm:text-lg font-bold text-text mt-0.5 sm:mt-1 leading-snug">
                {getQuestionPrompt(current)}
              </p>
              {getQuestionSubtitle(current) && (
                <p className="text-sm font-semibold text-primary">
                  {getQuestionSubtitle(current)}
                </p>
              )}
            </div>

            {/* Panda — réduit sur mobile pour ne pas écraser la question */}
            <div className="shrink-0 scale-75 sm:scale-90 md:scale-100 origin-right">
              <PandaMascot state={pandaState} />
            </div>
          </div>
        </div>

        {/* Options de réponse
            - Mobile (< sm) : 1 colonne, options empilées
            - Tablette+ (sm+) : 2 colonnes
            Les options courtes (hanzi) tirent parti de la grille 2 colonnes dès sm.
            Les options longues (phrases françaises) restent en 1 colonne via `sm:grid-cols-2`
            et s'étendent naturellement. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {shuffledOptions.map((opt) => {
            const isSelected = selected === opt;
            const isCorrect  = answerState !== "idle" && opt === current.answer;
            const isWrong    = answerState === "wrong" && isSelected && opt !== current.answer;

            return (
              <button
                key={opt}
                disabled={answerState !== "idle"}
                onClick={() => answerState === "idle" && setSelected(opt)}
                className={`w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl border-2 font-bold text-sm text-left transition-all
                  min-h-[52px] sm:min-h-[56px]
                  ${isCorrect
                    ? "border-green-400 bg-green-50 text-green-700"
                    : isWrong
                    ? "border-red-400 bg-red-50 text-red-700 animate-bounce"
                    : isSelected
                    ? "border-secondary bg-secondary/5 text-secondary"
                    : "border-border bg-card text-text hover:border-text-muted active:scale-[0.98]"
                  }
                  ${answerState !== "idle" ? "cursor-default" : ""}
                `}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="leading-snug">{opt}</span>
                  {isCorrect && <CheckCircle2 size={17} className="text-green-500 shrink-0" />}
                  {isWrong   && <AlertCircle  size={17} className="text-red-500 shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className={`border-t pt-3 sm:pt-4 pb-[max(env(safe-area-inset-bottom),16px)] sm:pb-6 px-3 sm:px-4 transition-colors duration-300
        ${answerState === "correct" ? "bg-green-50 border-green-200"
        : answerState === "wrong"   ? "bg-red-50 border-red-200"
        : "bg-card border-border"}`}>

        <div className="max-w-2xl w-full mx-auto flex items-center justify-between gap-3 sm:gap-4">

          {/* Feedback — toujours visible, même sur petit écran */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {answerState === "correct" && (
              <div className="text-green-600 flex items-center gap-2 sm:gap-3 font-bold min-w-0">
                {/* Icône ronde masquée sur mobile pour gagner de la place */}
                <div className="bg-green-100 p-1.5 sm:p-2 rounded-full hidden sm:flex">
                  <CheckCircle2 size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold">Excellent ! 🎉</p>
                  <p className="text-xs text-green-700/80 mt-0.5">+{XP_PER_CORRECT} XP</p>
                </div>
              </div>
            )}
            {answerState === "wrong" && (
              <div className="text-red-600 flex items-center gap-2 sm:gap-3 font-bold min-w-0">
                <div className="bg-red-100 p-1.5 sm:p-2 rounded-full hidden sm:flex">
                  <AlertCircle size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold">Oups… 😬</p>
                  <p className="text-xs text-red-700/80 mt-0.5 truncate">
                    Réponse : {current.answer}
                  </p>
                </div>
              </div>
            )}
            {/* Placeholder invisible pour maintenir la hauteur quand idle */}
            {answerState === "idle" && <div className="h-10" />}
          </div>

          {/* Bouton Vérifier / Continuer — taille de tap généreuse */}
          {answerState === "idle" ? (
            <button
              disabled={!selected}
              onClick={verify}
              className={`font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-sm shadow-sm transition-all whitespace-nowrap
                ${selected
                  ? "bg-secondary text-white hover:opacity-90 active:scale-95"
                  : "bg-border text-text-muted cursor-not-allowed"
                }`}
            >
              Vérifier
            </button>
          ) : (
            <button
              onClick={goNext}
              className={`font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-sm text-white shadow-sm active:scale-95 transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap
                ${answerState === "correct"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
                }`}
            >
              {isLast || hearts <= 0 ? "Voir les résultats" : "Continuer"}
              <ChevronRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}