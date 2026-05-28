// app/(app)/lesson/[id]/vocab/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { MOCK_LESSONS } from "@/lib/constants";
import { VocabItem } from "@/types";
import { ArrowLeft, Volume2, Mic, MicOff, ChevronRight, RotateCcw, CheckCircle2 } from "lucide-react";
import Lottie from "lottie-react";
import PandaMascot, { PandaState } from "@/components/lesson/PandaMascot/PandaMascot";

// ─── URLs Lottie (lottiefiles.com — 100% gratuit) ────────────────────────────
const LOTTIE_SUCCESS = "https://lottie.host/9dce9a92-d074-4db5-a17b-d22699d3e5b5/3GnFvBRPxN.json";
const LOTTIE_ERROR   = "https://lottie.host/b3d84d68-c2b3-4f78-9a9d-bb47e01c9a77/JNfaKLdxSK.json";
const LOTTIE_MIC     = "https://lottie.host/7c85cc78-f39b-4a9f-8a11-fde7e7e10dd4/dVlPGbkxpW.json";

// ─── Constantes ───────────────────────────────────────────────────────────────
const LISTEN_TIMEOUT_MS = 15000;
const MAX_ATTEMPTS      = 2;

type MicState = "idle" | "listening" | "success" | "fail";

// ─── Composant animation micro ────────────────────────────────────────────────
function MicWave({ isListening }: { isListening: boolean }) {
  const [anim, setAnim] = useState<any>(null);

  useEffect(() => {
    fetch(LOTTIE_MIC)
      .then((r) => r.json())
      .then(setAnim)
      .catch(() => setAnim(null));
  }, []);

  if (!anim || !isListening) return null;
  return (
    <div className="w-16 h-16 sm:w-20 sm:h-20">
      <Lottie animationData={anim} loop={true} />
    </div>
  );
}

export default function VocabPage() {
  const params  = useParams();
  const router  = useRouter();
  const lesson  = MOCK_LESSONS.find((l) => l.id === parseInt(params.id as string, 10));

  const [idx, setIdx]           = useState(0);
  const [micState, setMicState] = useState<MicState>("idle");
  const [attempts, setAttempts] = useState(0);
  const [heard, setHeard]       = useState("");
  const [pandaState, setPandaState] = useState<PandaState>("idle");
  const [showExample, setShowExample] = useState(false);

  // Animations Lottie
  const [successAnim, setSuccessAnim] = useState<any>(null);
  const [errorAnim,   setErrorAnim]   = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError,   setShowError]   = useState(false);

  // Animation d'entrée de la card
  const [cardVisible, setCardVisible] = useState(false);

  // ── Modale retour ──────────────────────────────────────────────────────────
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  const timeoutRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recognRef   = useRef<any>(null);
  const hasAutoRef  = useRef(false);

  const vocab: VocabItem[] = lesson?.vocabulaire ?? [];
  const current            = vocab[idx];
  const progress           = vocab.length > 0 ? (idx / vocab.length) * 100 : 0;
  const isLast             = idx === vocab.length - 1;

  // ─── Chargement des animations Lottie ──────────────────────────────────
  useEffect(() => {
    fetch(LOTTIE_SUCCESS).then((r) => r.json()).then(setSuccessAnim).catch(() => {});
    fetch(LOTTIE_ERROR).then((r) => r.json()).then(setErrorAnim).catch(() => {});
  }, []);

  // ─── Animation d'entrée card ───────────────────────────────────────────
  useEffect(() => {
    setCardVisible(false);
    const t = setTimeout(() => setCardVisible(true), 50);
    return () => clearTimeout(t);
  }, [idx]);

  useEffect(() => {
    if (micState === "listening") setPandaState("listening");
    else if (micState === "success") setPandaState("success");
    else if (micState === "fail")    setPandaState("fail");
    else setPandaState("idle");
  }, [micState]);

  // ─── TTS ──────────────────────────────────────────────────────────────────
  const speak = useCallback((text: string, slow = false): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis) { resolve(); return; }
      window.speechSynthesis.cancel();
      const u   = new SpeechSynthesisUtterance(text);
      u.lang    = "zh-CN";
      u.rate    = slow ? 0.55 : 0.9;
      u.onend   = () => resolve();
      u.onerror = () => resolve();
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

    const rec            = new SR();
    rec.lang             = "zh-CN";
    rec.interimResults   = false;
    rec.maxAlternatives  = 3;
    recognRef.current    = rec;

    timeoutRef.current = setTimeout(async () => {
      stopListening();
      if (attemptNum < MAX_ATTEMPTS) {
        setAttempts((a) => a + 1);
        setMicState("idle");
        await speakInstruction(expectedHanzi);
        startListening(expectedHanzi, attemptNum + 1);
      } else {
        setMicState("fail");
        setHeard("");
        // Animation erreur
        setShowError(true);
        setTimeout(() => setShowError(false), 2500);
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
        // Animation succès
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2500);
      } else if (attemptNum < MAX_ATTEMPTS) {
        setAttempts((a) => a + 1);
        setMicState("idle");
        setTimeout(async () => {
          await speakInstruction(expectedHanzi);
          startListening(expectedHanzi, attemptNum + 1);
        }, 600);
      } else {
        setMicState("fail");
        setShowError(true);
        setTimeout(() => setShowError(false), 2500);
      }
    };

    rec.onerror = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setMicState("fail");
      setShowError(true);
      setTimeout(() => setShowError(false), 2500);
    };

    rec.start();
  }, [speakInstruction, stopListening]);

  // ─── Séquence auto à chaque nouveau mot ──────────────────────────────────
  useEffect(() => {
    if (!current) return;
    hasAutoRef.current = false;
    setMicState("idle");
    setAttempts(0);
    setHeard("");
    setShowExample(false);
    setShowSuccess(false);
    setShowError(false);

    let cancelled = false;

    (async () => {
      await new Promise((r) => setTimeout(r, 500));
      if (cancelled || hasAutoRef.current) return;
      hasAutoRef.current = true;
      await speakInstruction(current.hanzi);
      if (cancelled) return;
      startListening(current.hanzi, 0);
    })();

    return () => {
      cancelled = true;
      stopListening();
      window.speechSynthesis?.cancel();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  // ─── Navigation ───────────────────────────────────────────────────────────
  const goNext = useCallback(() => {
    stopListening();
    window.speechSynthesis?.cancel();
    if (isLast) {
      const stored = localStorage.getItem(`lesson_progress_${lesson?.id}`);
      const prev   = stored ? JSON.parse(stored) : {};
      localStorage.setItem(
        `lesson_progress_${lesson?.id}`,
        JSON.stringify({ ...prev, vocabDone: true })
      );
      router.push(`/lesson/${lesson?.id}/dialogue`);
    } else {
      setIdx((i) => i + 1);
    }
  }, [isLast, lesson?.id, router, stopListening]);

  const handleRetry = useCallback(async () => {
    setAttempts(0);
    setMicState("idle");
    setHeard("");
    setShowSuccess(false);
    setShowError(false);
    await speakInstruction(current.hanzi);
    startListening(current.hanzi, 0);
  }, [current, speakInstruction, startListening]);

  // ─── Retour ───────────────────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    stopListening();
    window.speechSynthesis?.cancel();
    setShowBackConfirm(true);
  }, [stopListening]);

  if (!lesson || vocab.length === 0) {
    return (
      <div className="flex items-center justify-center h-[100dvh]">
        <p className="text-text-muted font-bold">Leçon introuvable.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-[90] flex flex-col h-[100dvh] select-none overflow-hidden">

      {/* ── Modale confirmation retour ── */}
      {showBackConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 px-6">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl flex flex-col gap-4">
            <h3 className="text-lg font-black text-text">Quitter le vocabulaire ?</h3>
            <p className="text-sm text-text-muted">Ta progression dans cette session sera perdue.</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => {
                  setShowBackConfirm(false);
                  // reprendre la séquence audio
                  speakInstruction(current.hanzi).then(() => startListening(current.hanzi, 0));
                }}
                className="px-5 py-3 rounded-xl bg-border text-text-muted font-bold text-sm hover:bg-border/70 transition"
              >
                Continuer la leçon
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-5 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition"
              >
                Quitter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Overlay Lottie succès ── */}
      {showSuccess && successAnim && (
        <div className="pointer-events-none fixed inset-0 z-[200] flex items-center justify-center">
          <div className="w-56 h-56 sm:w-72 sm:h-72">
            <Lottie animationData={successAnim} loop={false} />
          </div>
        </div>
      )}

      {/* ── Overlay Lottie erreur ── */}
      {showError && errorAnim && (
        <div className="pointer-events-none fixed inset-0 z-[200] flex items-center justify-center">
          <div className="w-44 h-44 sm:w-56 sm:h-56">
            <Lottie animationData={errorAnim} loop={false} />
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="max-w-2xl w-full mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-3 sm:gap-4">
        <button
          onClick={handleBack}
          className="text-text-muted hover:text-text transition p-2 -ml-1 rounded-lg hover:bg-border/40"
          title="Retour"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 h-2 sm:h-2.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs font-bold text-text-muted tabular-nums whitespace-nowrap">
          {idx + 1} / {vocab.length}
        </span>
      </div>

      {/* Label partie */}
      <div className="max-w-2xl w-full mx-auto px-3 sm:px-4 mb-1 sm:mb-2">
        <span className="text-[10px] uppercase tracking-widest font-bold text-primary/70">
          Partie 1 · Vocabulaire — {lesson.title}
        </span>
      </div>

      {/* ── ZONE CENTRALE ── */}
      <div className="flex-1 max-w-2xl w-full mx-auto px-3 sm:px-4 flex flex-col justify-center gap-3 sm:gap-4 overflow-y-auto pb-4">

        {/* Card mot — animation slide-up à chaque nouveau mot */}
        <div
          className={`bg-card border border-border rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col items-center text-center gap-2
            transition-all duration-300
            ${cardVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          `}
        >
          {/* Hanzi — bounce léger à l'apparition */}
          <h2
            className={`text-6xl sm:text-7xl md:text-8xl font-black text-text leading-none tracking-tight
              transition-all duration-500
              ${cardVisible ? "scale-100" : "scale-90"}
            `}
            style={{ fontFamily: "'Noto Serif SC', serif" }}
          >
            {current.hanzi}
          </h2>

          {/* Pinyin */}
          <p className="text-lg sm:text-xl font-bold text-primary tracking-widest mt-1">
            {current.pinyin}
          </p>

          {/* Traduction */}
          <p className="text-sm sm:text-base font-semibold text-text-muted mt-0.5">
            {current.french}
          </p>

          {/* Boutons audio */}
          <div className="flex items-center gap-2 mt-2 sm:mt-3">
            <button
              onClick={() => speak(current.hanzi, false)}
              className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs px-3 sm:px-4 py-2 rounded-lg transition active:scale-95"
            >
              <Volume2 size={13} /> Normal
            </button>
            <button
              onClick={() => speak(current.hanzi, true)}
              className="flex items-center gap-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 font-bold text-xs px-3 sm:px-4 py-2 rounded-lg transition active:scale-95"
            >
              🐢 Lent
            </button>
          </div>
        </div>

        {/* ── ZONE MICRO ── */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex flex-col items-center gap-2 sm:gap-3">
          {/* Panda mascotte */}
          <PandaMascot state={pandaState} word={current.hanzi} />
          <p className="text-xs font-bold uppercase tracking-wider text-text-muted text-center">
            {micState === "idle"      && attempts === 0 && "Écoute et répète…"}
            {micState === "idle"      && attempts >  0  && `Tentative ${attempts + 1} / ${MAX_ATTEMPTS + 1} — réessaie !`}
            {micState === "listening"                   && "🎙 Parle maintenant…"}
            {micState === "success"                     && "✓ Bonne prononciation !"}
            {micState === "fail"      && heard          && `Entendu : "${heard}"`}
            {micState === "fail"      && !heard         && "Pas de réponse détectée"}
          </p>

          {/* Lottie onde micro OU bouton micro classique */}
          {micState === "listening" ? (
            <MicWave isListening={true} />
          ) : (
            <button
              onClick={handleRetry}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-md transition-all
                ${micState === "success"
                  ? "bg-green-500 text-white cursor-default"
                  : micState === "fail"
                  ? "bg-amber-500 text-white hover:opacity-90 active:scale-95"
                  : "bg-primary text-white hover:opacity-90 active:scale-95 animate-pulse"
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
          )}

          {/* Feedback succès */}
          {micState === "success" && (
            <p className="text-green-600 text-xs font-bold bg-green-50 px-3 py-1.5 rounded-lg animate-bounce">
              🎉 Parfait ! Tu peux passer au mot suivant.
            </p>
          )}

          {/* Feedback échec */}
          {micState === "fail" && (
            <div className="flex gap-2">
              <button
                onClick={handleRetry}
                className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 font-bold text-xs px-3 py-2 rounded-lg transition active:scale-95"
              >
                <RotateCcw size={13} className="animate-spin-once" /> Réessayer
              </button>
              <button
                onClick={goNext}
                className="flex items-center gap-1.5 bg-border hover:bg-border/70 text-text-muted font-bold text-xs px-3 py-2 rounded-lg transition active:scale-95"
              >
                Passer <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>

        {/* ── EXEMPLE ── */}
        {current.example && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowExample((s) => !s)}
              className="w-full px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-text-muted hover:bg-border/30 transition"
            >
              Voir la phrase d'exemple
              <ChevronRight
                size={14}
                className={`transition-transform duration-300 ${showExample ? "rotate-90" : ""}`}
              />
            </button>
            {showExample && (
              <div className="px-4 sm:px-5 pb-4 flex flex-col gap-1 border-t border-border pt-3 animate-fade-in">
                <p
                  className="text-base sm:text-lg font-bold text-text"
                  style={{ fontFamily: "'Noto Serif SC', serif" }}
                >
                  {current.example.hanzi}
                </p>
                <p className="text-sm font-semibold text-primary">{current.example.pinyin}</p>
                <p className="text-sm text-text-muted">{current.example.french}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => speak(current.example!.hanzi, false)}
                    className="flex items-center gap-1.5 bg-primary/10 text-primary font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-primary/20 transition active:scale-95"
                  >
                    <Volume2 size={12} /> Écouter
                  </button>
                  <button
                    onClick={() => speak(current.example!.hanzi, true)}
                    className="flex items-center gap-1.5 bg-orange-500/10 text-orange-600 font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-orange-500/20 transition active:scale-95"
                  >
                    🐢 Lent
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div className="border-t border-border bg-card px-3 sm:px-4 pt-3 sm:pt-4 pb-5 sm:pb-6">
        <div className="max-w-2xl w-full mx-auto">
          <button
            onClick={goNext}
            disabled={micState === "listening"}
            className={`w-full py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all shadow-sm active:scale-[0.98]
              ${micState === "success"
                ? "bg-green-600 text-white hover:bg-green-700"
                : micState === "listening"
                ? "bg-border text-text-muted cursor-not-allowed"
                : "bg-secondary text-white hover:opacity-90"
              }
            `}
          >
            {micState === "success"
              ? isLast ? "🎓 Terminer le vocabulaire →" : "✨ Mot suivant →"
              : isLast ? "Terminer quand même →"         : "Passer ce mot →"
            }
          </button>
        </div>
      </div>

    </div>
  );
}