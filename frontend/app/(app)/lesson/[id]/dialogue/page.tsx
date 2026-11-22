// app/(app)/lesson/[id]/dialogue/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { useLesson } from "@/hooks/useLessons";
import { useProgressStore } from "@/store/progressStore";
import { LessonLoading, LessonUnavailable } from "@/components/lesson/LessonState/LessonState";
import { DialogueLine } from "@/types";
import { ChevronLeft, ChevronRight, Volume2, Mic, MicOff, RotateCcw, CheckCircle2, MessageSquare } from "lucide-react";
import PandaMascot, { PandaState } from "@/components/lesson/PandaMascot/PandaMascot";

// ─── Constantes ───────────────────────────────────────────────────────────────
const LISTEN_TIMEOUT_MS = 15000;
const MAX_ATTEMPTS      = 2;

type MicState = "idle" | "listening" | "success" | "fail";
type Phase    = "discovery" | "practice";

export default function DialoguePage() {
  const params = useParams<{ id: string }>();
  const router  = useRouter();
  const { lesson, loading, error } = useLesson(Number(params.id));
  const completeDialogue = useProgressStore((s) => s.completeDialogue);

  const dialogue: DialogueLine[] = lesson?.dialogue ?? [];

  // ── Phase discovery ──
  const [phase, setPhase]                 = useState<Phase>("discovery");
  const [discoveryIdx, setDiscoveryIdx]   = useState(0);
  const [discoveryDone, setDiscoveryDone] = useState(false);

  // ── Phase practice ──
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [micState, setMicState]       = useState<MicState>("idle");
  const [attempts, setAttempts]       = useState(0);
  const [heard, setHeard]             = useState("");

  // ── Panda ──
  const [pandaState, setPandaState] = useState<PandaState>("idle");

  const timeoutRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recognRef    = useRef<any>(null);
  const hasAutoRef   = useRef(false);
  const cancelledRef = useRef(false);

  const currentLine = dialogue[practiceIdx];
  const progress    = phase === "discovery"
    ? (discoveryIdx / dialogue.length) * 50
    : 50 + (practiceIdx / dialogue.length) * 50;

  // ─── Sync pandaState ← micState (phase practice) ─────────────────────────
  useEffect(() => {
    if (phase !== "practice") return;
    if (micState === "listening") setPandaState("listening");
    else if (micState === "success") setPandaState("success");
    else if (micState === "fail")    setPandaState("fail");
    else setPandaState("idle");
  }, [micState, phase]);

  // ─── TTS ──────────────────────────────────────────────────────────────────
  const speak = useCallback((text: string, lang: string, slow = false): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis) { resolve(); return; }
      window.speechSynthesis.cancel();
      const u   = new SpeechSynthesisUtterance(text);
      u.lang    = lang;
      u.rate    = slow ? 0.55 : 0.9;
      u.onend   = () => resolve();
      u.onerror = () => resolve();
      window.speechSynthesis.speak(u);
    });
  }, []);

  const speakWithPanda = useCallback((text: string, lang: string, slow = false): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis) { resolve(); return; }
      window.speechSynthesis.cancel();
      setPandaState("speaking");
      const u   = new SpeechSynthesisUtterance(text);
      u.lang    = lang;
      u.rate    = slow ? 0.55 : 0.9;
      u.onend   = () => { setPandaState("idle"); resolve(); };
      u.onerror = () => { setPandaState("idle"); resolve(); };
      window.speechSynthesis.speak(u);
    });
  }, []);

  const speakInstruction = useCallback((hanzi: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis) { resolve(); return; }
      window.speechSynthesis.cancel();
      setPandaState("speaking");
      const intro  = new SpeechSynthesisUtterance("Répète après moi :");
      intro.lang   = "fr-FR";
      intro.rate   = 1;
      const word   = new SpeechSynthesisUtterance(hanzi);
      word.lang    = "zh-CN";
      word.rate    = 0.85;
      word.onend   = () => { setPandaState("idle"); resolve(); };
      word.onerror = () => { setPandaState("idle"); resolve(); };
      intro.onend  = () => window.speechSynthesis.speak(word);
      window.speechSynthesis.speak(intro);
    });
  }, []);

  // ─── Micro ────────────────────────────────────────────────────────────────
  const stopListening = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    try { recognRef.current?.stop(); } catch (_) {}
    recognRef.current = null;
  }, []);

  const startListening = useCallback((expectedHanzi: string, attemptNum: number) => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    stopListening();
    setMicState("listening");

    const rec           = new SR();
    rec.lang            = "zh-CN";
    rec.interimResults  = false;
    rec.maxAlternatives = 3;
    recognRef.current   = rec;

    timeoutRef.current = setTimeout(async () => {
      stopListening();
      if (attemptNum < MAX_ATTEMPTS) {
        setAttempts((a) => a + 1);
        setMicState("idle");
        await speakInstruction(expectedHanzi);
        if (!cancelledRef.current) startListening(expectedHanzi, attemptNum + 1);
      } else {
        setMicState("fail");
        setHeard("");
      }
    }, LISTEN_TIMEOUT_MS);

    rec.onresult = (e: any) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      stopListening();
      const results: string[] = [];
      for (let i = 0; i < e.results[0].length; i++) results.push(e.results[0][i].transcript);
      const top   = results[0];
      setHeard(top);
      const clean = (s: string) => s.replace(/[\s，。！？、]/g, "");
      const ok    = results.some((r) => clean(r) === clean(expectedHanzi));
      if (ok) {
        setMicState("success");
      } else if (attemptNum < MAX_ATTEMPTS) {
        setAttempts((a) => a + 1);
        setMicState("idle");
        setTimeout(async () => {
          if (cancelledRef.current) return;
          await speakInstruction(expectedHanzi);
          if (!cancelledRef.current) startListening(expectedHanzi, attemptNum + 1);
        }, 600);
      } else {
        setMicState("fail");
      }
    };

    rec.onerror = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setMicState("fail");
    };

    rec.start();
  }, [speakInstruction, stopListening]);

  // ─── PHASE DISCOVERY ──────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "discovery") return;
    cancelledRef.current = false;
    setPandaState("idle");

    const lines = dialogue;
    if (lines.length === 0) return;

    (async () => {
      await new Promise((r) => setTimeout(r, 400));
      if (cancelledRef.current) return;

      await speakWithPanda("Écoute bien ce dialogue.", "fr-FR");
      if (cancelledRef.current) return;

      for (let i = 0; i < lines.length; i++) {
        if (cancelledRef.current) return;
        setDiscoveryIdx(i);

        const who = lines[i].speaker === "A" ? "Personnage A :" : "Personnage B :";
        await speakWithPanda(who, "fr-FR");
        if (cancelledRef.current) return;

        await speakWithPanda(lines[i].hanzi, "zh-CN");
        if (cancelledRef.current) return;

        await new Promise((r) => setTimeout(r, 700));
      }

      if (cancelledRef.current) return;
      setDiscoveryDone(true);
      setPandaState("success");
      setTimeout(() => setPandaState("idle"), 2000);
    })();

    return () => { cancelledRef.current = true; window.speechSynthesis?.cancel(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, dialogue.length]);

  // ─── PHASE PRACTICE ───────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "practice" || !currentLine) return;
    cancelledRef.current = false;
    hasAutoRef.current   = false;

    setMicState("idle");
    setAttempts(0);
    setHeard("");
    setPandaState("idle");

    (async () => {
      await new Promise((r) => setTimeout(r, 400));
      if (cancelledRef.current || hasAutoRef.current) return;
      hasAutoRef.current = true;

      await speakInstruction(currentLine.hanzi);
      if (cancelledRef.current) return;

      startListening(currentLine.hanzi, 0);
    })();

    return () => {
      cancelledRef.current = true;
      stopListening();
      window.speechSynthesis?.cancel();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, practiceIdx]);

  // ─── Navigation practice ──────────────────────────────────────────────────
  const goNextLine = useCallback(() => {
    stopListening();
    window.speechSynthesis?.cancel();
    cancelledRef.current = true;

    const isLast = practiceIdx === dialogue.length - 1;
    if (isLast) {
      if (lesson) completeDialogue(lesson.id);
      router.push(`/lesson/${lesson?.id}/quiz`);
    } else {
      cancelledRef.current = false;
      setPracticeIdx((i) => i + 1);
    }
  }, [practiceIdx, dialogue.length, lesson, completeDialogue, router, stopListening]);

  const handleRetry = useCallback(async () => {
    setAttempts(0);
    setMicState("idle");
    setHeard("");
    cancelledRef.current = false;
    await speakInstruction(currentLine.hanzi);
    startListening(currentLine.hanzi, 0);
  }, [currentLine, speakInstruction, startListening]);

  // ─── Garde ────────────────────────────────────────────────────────────────
  if (loading) return <LessonLoading />;
  if (!lesson || dialogue.length === 0) {
    return <LessonUnavailable error={error} />;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ── RENDU PHASE DISCOVERY ─────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === "discovery") {
    return (
      <div className="fixed inset-0 bg-background z-[90] flex flex-col h-[100dvh] select-none">

        {/* Header discovery :  ←vocab  [progress]  →practice (si done) */}
        <div className="max-w-2xl w-full mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-3 sm:gap-4">

          {/* ← Retour vers la page vocabulaire */}
          <button
            onClick={() => {
              cancelledRef.current = true;
              window.speechSynthesis?.cancel();
              router.push(`/lesson/${lesson.id}/vocab`);
            }}
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

          {/* Label + → vers practice (visible uniquement quand discovery terminée) */}
          {discoveryDone ? (
            <button
              onClick={() => {
                cancelledRef.current = true;
                window.speechSynthesis?.cancel();
                setPandaState("idle");
                setPhase("practice");
              }}
              className="text-text-muted hover:text-text transition p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <ChevronRight size={20} />
            </button>
          ) : (
            <span className="text-[11px] sm:text-xs font-bold text-text-muted whitespace-nowrap">
              <span className="hidden sm:inline">Partie 2 · </span>Dialogue
            </span>
          )}
        </div>

        {/* Label */}
        <div className="max-w-2xl w-full mx-auto px-3 sm:px-4 mb-1 sm:mb-2">
          <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-primary/70">
            Écoute d'abord —{" "}
            <span className="hidden sm:inline">{lesson.title}</span>
            <span className="inline sm:hidden">{lesson.title.length > 20 ? lesson.title.slice(0, 20) + "…" : lesson.title}</span>
          </span>
        </div>

        {/* Panda */}
        <div className="max-w-2xl w-full mx-auto px-3 sm:px-4 mb-1 sm:mb-2 flex justify-center">
          <div className="scale-75 sm:scale-90 md:scale-100 origin-top">
            <PandaMascot
              state={pandaState}
              word={discoveryDone ? undefined : dialogue[discoveryIdx]?.hanzi}
            />
          </div>
        </div>

        {/* Bulles dialogue */}
        <div className="flex-1 max-w-2xl w-full mx-auto px-3 sm:px-4 flex flex-col justify-start gap-2 sm:gap-3 overflow-y-auto pb-4">
          {dialogue.map((line, i) => {
            const isActive = i === discoveryIdx;
            const isPast   = i < discoveryIdx || discoveryDone;
            const isFuture = !isActive && !isPast;

            return (
              <div
                key={line.id}
                className={`flex flex-col gap-0.5 sm:gap-1 transition-all duration-300
                  ${line.speaker === "B" ? "items-end" : "items-start"}
                  ${isFuture ? "opacity-30" : "opacity-100"}
                `}
              >
                <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1
                  ${line.speaker === "A" ? "text-blue-400" : "text-green-500"}`}>
                  <span className="inline sm:hidden">Perso {line.speaker}</span>
                  <span className="hidden sm:inline">Personnage {line.speaker}</span>
                </span>

                <div className={`max-w-[90%] sm:max-w-[85%] px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl border-2 transition-all duration-300
                  ${line.speaker === "A"
                    ? "rounded-tl-none bg-blue-50 border-blue-100"
                    : "rounded-tr-none bg-green-50 border-green-100"
                  }
                  ${isActive ? "shadow-md scale-[1.02]" : "scale-100"}
                `}>
                  <p
                    className="text-xl sm:text-2xl font-black text-text leading-snug"
                    style={{ fontFamily: "'Noto Serif SC', serif" }}
                  >
                    {line.hanzi}
                  </p>
                  <p className={`text-xs sm:text-sm font-semibold mt-0.5 sm:mt-1
                    ${line.speaker === "A" ? "text-blue-500" : "text-green-600"}`}>
                    {line.pinyin}
                  </p>
                  <p className="text-[11px] sm:text-xs text-text-muted mt-0.5">{line.french}</p>

                  {(isActive || isPast) && (
                    <button
                      onClick={() => speakWithPanda(line.hanzi, "zh-CN")}
                      className="mt-1.5 sm:mt-2 flex items-center gap-1 text-[11px] font-bold text-text-muted hover:text-text transition min-h-[36px]"
                    >
                      <Volume2 size={12} /> Réécouter
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-card px-3 sm:px-4 pt-3 sm:pt-4 pb-[env(safe-area-inset-bottom,16px)] sm:pb-6">
          <div className="max-w-2xl w-full mx-auto">
            <button
              onClick={() => {
                cancelledRef.current = true;
                window.speechSynthesis?.cancel();
                setPandaState("idle");
                setPhase("practice");
              }}
              disabled={!discoveryDone}
              className={`w-full py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all shadow-sm
                ${discoveryDone
                  ? "bg-primary text-white hover:opacity-90 active:scale-[0.98]"
                  : "bg-border text-text-muted cursor-not-allowed"
                }
              `}
            >
              {discoveryDone ? "C'est parti, à toi de répéter ! →" : "Écoute le dialogue…"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ── RENDU PHASE PRACTICE ──────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  const isLastLine = practiceIdx === dialogue.length - 1;

  return (
    <div className="fixed inset-0 bg-background z-[90] flex flex-col h-[100dvh] select-none">

      {/* Header practice : ←discovery  [progress]  compteur  →quiz */}
      <div className="max-w-2xl w-full mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-3 sm:gap-4">

        {/* ← Retour vers discovery */}
        <button
          onClick={() => {
            stopListening();
            window.speechSynthesis?.cancel();
            cancelledRef.current = true;
            setPhase("discovery");
          }}
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

        {/* Compteur de répliques */}
        <span className="text-[11px] sm:text-xs font-bold text-text-muted whitespace-nowrap tabular-nums">
          {practiceIdx + 1} / {dialogue.length}
        </span>

        {/* → Avancer vers le quiz */}
        <button
          onClick={() => {
            stopListening();
            window.speechSynthesis?.cancel();
            router.push(`/lesson/${lesson.id}/quiz`);
          }}
          className="text-text-muted hover:text-text transition p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Label */}
      <div className="max-w-2xl w-full mx-auto px-3 sm:px-4 mb-1 sm:mb-2">
        <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-primary/70">
          <span className="hidden sm:inline">Partie 2 · Répète chaque réplique — {lesson.title}</span>
          <span className="inline sm:hidden">Répète — {lesson.title.length > 18 ? lesson.title.slice(0, 18) + "…" : lesson.title}</span>
        </span>
      </div>

      {/* Zone centrale */}
      <div className="flex-1 max-w-2xl w-full mx-auto px-3 sm:px-4 flex flex-col justify-start sm:justify-center gap-3 sm:gap-4 overflow-y-auto pb-4">

        {/* Lignes passées */}
        {practiceIdx > 0 && (
          <div className="flex flex-col gap-1.5 sm:gap-2 opacity-40">
            {dialogue.slice(Math.max(0, practiceIdx - 2), practiceIdx).map((line) => (
              <div key={line.id}
                   className={`flex ${line.speaker === "B" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] sm:max-w-[75%] px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-sm border
                  ${line.speaker === "A"
                    ? "bg-blue-50 border-blue-100 rounded-tl-none"
                    : "bg-green-50 border-green-100 rounded-tr-none text-right"
                  }`}>
                  <p
                    className="font-bold text-text text-sm sm:text-base"
                    style={{ fontFamily: "'Noto Serif SC', serif" }}
                  >
                    {line.hanzi}
                  </p>
                  <p className="text-[10px] sm:text-xs text-text-muted">{line.french}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bulle active */}
        <div className={`flex ${currentLine.speaker === "B" ? "justify-end" : "justify-start"}`}>
          <div className={`max-w-[92%] sm:max-w-[85%] px-4 sm:px-5 py-3 sm:py-4 rounded-2xl border-2 shadow-md
            ${currentLine.speaker === "A"
              ? "bg-blue-50 border-blue-200 rounded-tl-none"
              : "bg-green-50 border-green-200 rounded-tr-none"
            }`}>
            <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2">
              <MessageSquare size={11} className={currentLine.speaker === "A" ? "text-blue-400" : "text-green-500"} />
              <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider
                ${currentLine.speaker === "A" ? "text-blue-400" : "text-green-500"}`}>
                <span className="hidden sm:inline">Personnage </span>Perso {currentLine.speaker}
              </span>
            </div>
            <p
              className="text-3xl sm:text-4xl md:text-5xl font-black text-text leading-tight"
              style={{ fontFamily: "'Noto Serif SC', serif" }}
            >
              {currentLine.hanzi}
            </p>
            <p className={`text-sm sm:text-base font-bold mt-1
              ${currentLine.speaker === "A" ? "text-blue-500" : "text-green-600"}`}>
              {currentLine.pinyin}
            </p>
            <p className="text-xs sm:text-sm text-text-muted mt-0.5">{currentLine.french}</p>
            <div className="flex gap-1.5 sm:gap-2 mt-2 sm:mt-3">
              <button
                onClick={() => speakWithPanda(currentLine.hanzi, "zh-CN", false)}
                className="flex items-center gap-1 bg-white/70 hover:bg-white text-text-muted font-bold text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-lg border border-border transition min-h-[36px]"
              >
                <Volume2 size={11} /> Normal
              </button>
              <button
                onClick={() => speakWithPanda(currentLine.hanzi, "zh-CN", true)}
                className="flex items-center gap-1 bg-white/70 hover:bg-white text-orange-600 font-bold text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-lg border border-border transition min-h-[36px]"
              >
                🐢 Lent
              </button>
            </div>
          </div>
        </div>

        {/* Zone micro + Panda */}
        <div className="bg-card border border-border rounded-2xl p-3 sm:p-5 flex flex-col items-center gap-2 sm:gap-3">
          <div className="scale-75 sm:scale-90 md:scale-100 origin-top">
            <PandaMascot state={pandaState} word={currentLine.hanzi} />
          </div>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-muted text-center">
            {micState === "idle"      && attempts === 0 && "Écoute et répète cette réplique…"}
            {micState === "idle"      && attempts >  0  && `Tentative ${attempts + 1}/${MAX_ATTEMPTS + 1} — réessaie !`}
            {micState === "listening"                   && "🎙 Parle maintenant…"}
            {micState === "success"                     && "✓ Bonne prononciation !"}
            {micState === "fail"      && heard          && `Entendu : "${heard}"`}
            {micState === "fail"      && !heard         && "Pas de réponse détectée"}
          </p>
          <button
            onClick={() => { if (micState !== "listening") handleRetry(); }}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-md transition-all
              ${micState === "listening"
                ? "bg-red-500 text-white animate-pulse cursor-default"
                : micState === "success"
                ? "bg-green-500 text-white cursor-default"
                : micState === "fail"
                ? "bg-amber-500 text-white hover:opacity-90 active:scale-95"
                : "bg-primary text-white hover:opacity-90 active:scale-95"
              }
            `}
          >
            {micState === "success"
              ? <CheckCircle2 size={24} />
              : micState === "fail"
              ? <MicOff size={22} />
              : <Mic size={22} />
            }
          </button>
          {micState === "success" && (
            <p className="text-green-600 text-[11px] sm:text-xs font-bold bg-green-50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg animate-bounce text-center">
              🎉 Parfait ! Réplique suivante.
            </p>
          )}
          {micState === "fail" && (
            <div className="flex gap-1.5 sm:gap-2">
              <button
                onClick={handleRetry}
                className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 font-bold text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg transition min-h-[40px]"
              >
                <RotateCcw size={13} /> Réessayer
              </button>
              <button
                onClick={goNextLine}
                className="flex items-center gap-1.5 bg-border hover:bg-border/70 text-text-muted font-bold text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg transition min-h-[40px]"
              >
                Passer <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-card px-3 sm:px-4 pt-3 sm:pt-4 pb-[max(env(safe-area-inset-bottom),16px)] sm:pb-6">
        <div className="max-w-2xl w-full mx-auto">
          <button
            onClick={goNextLine}
            disabled={micState === "listening"}
            className={`w-full py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all shadow-sm
              ${micState === "success"
                ? "bg-green-600 text-white hover:bg-green-700 active:scale-[0.98]"
                : micState === "listening"
                ? "bg-border text-text-muted cursor-not-allowed"
                : "bg-secondary text-white hover:opacity-90 active:scale-[0.98]"
              }
            `}
          >
            {micState === "success"
              ? isLastLine ? "Terminer le dialogue →" : "Réplique suivante →"
              : isLastLine ? "Terminer quand même →"  : "Passer cette réplique →"
            }
          </button>
        </div>
      </div>
    </div>
  );
}