// lib/speech.ts — voix du navigateur : faire parler (synthèse) et écouter l'élève (reconnaissance).
// Un seul endroit pour la Web Speech API : les pages de leçon n'y touchent plus directement.

// ── Typage minimal de la reconnaissance vocale (absente des types standard de TypeScript) ──
interface RecognitionAlternative {
  transcript: string;
}
interface RecognitionResultEvent {
  results: ArrayLike<ArrayLike<RecognitionAlternative>>;
}
interface Recognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  abort(): void;
}
type RecognitionConstructor = new () => Recognition;

function recognitionConstructor(): RecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Le navigateur sait-il écouter ? (Chrome, Edge, Safari : oui ; Firefox : non) */
export function canListen(): boolean {
  return recognitionConstructor() !== null;
}

// ── Comparaison de ce qui a été entendu avec ce qui était attendu ──

/** Retire espaces et ponctuation (chinoise comme latine) : « 你好！» et « 你好 » sont égaux. */
export function normalizeHanzi(text: string): string {
  return text.replace(/[\s\p{P}]/gu, "");
}

/** Vrai si l'une des interprétations du navigateur correspond au texte attendu. */
export function matchesHanzi(heard: readonly string[], expected: string): boolean {
  const target = normalizeHanzi(expected);
  return target.length > 0 && heard.some((h) => normalizeHanzi(h) === target);
}

// ── Synthèse vocale ──

export type Utterance = { text: string; lang?: string; rate?: number };

/** Lit les phrases l'une après l'autre ; la promesse se termine quand tout est lu (ou interrompu). */
export function speakSequence(parts: readonly Utterance[]): Promise<void> {
  if (typeof window === "undefined" || !window.speechSynthesis || parts.length === 0) return Promise.resolve();
  window.speechSynthesis.cancel();
  return new Promise((resolve) => {
    const next = (i: number) => {
      if (i >= parts.length) return resolve();
      const { text, lang = "zh-CN", rate = 0.9 } = parts[i];
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.onend = () => next(i + 1);
      utterance.onerror = () => resolve(); // interrompu (cancel) ou voix indisponible
      window.speechSynthesis.speak(utterance);
    };
    next(0);
  });
}

/** Prononce un texte chinois, à vitesse normale ou lente. */
export function speak(text: string, slow = false): Promise<void> {
  return speakSequence([{ text, rate: slow ? 0.55 : 0.9 }]);
}

/** « Répète après moi : » en français, puis le mot en chinois. */
export function speakRepeatAfterMe(hanzi: string): Promise<void> {
  return speakSequence([
    { text: "Répète après moi :", lang: "fr-FR", rate: 1 },
    { text: hanzi, rate: 0.85 },
  ]);
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
}

// ── Reconnaissance vocale ──

/**
 * - unsupported : navigateur sans reconnaissance vocale
 * - denied      : micro refusé par l'utilisateur
 * - silence     : rien de compréhensible entendu avant la fin du délai
 * - aborted     : écoute arrêtée par l'application (changement de mot, sortie de page…)
 */
export type ListenError = "unsupported" | "denied" | "silence" | "aborted";
export type ListenResult = { heard: string[]; error: ListenError | null };
export type Listening = { result: Promise<ListenResult>; stop: () => void };

/** Écoute une seule réponse en chinois. Toujours résolu, jamais rejeté : le résultat dit ce qui s'est passé. */
export function listenOnce({ timeoutMs = 15000, alternatives = 3 } = {}): Listening {
  const Constructor = recognitionConstructor();
  if (!Constructor) {
    return { result: Promise.resolve({ heard: [], error: "unsupported" }), stop: () => {} };
  }

  const recognition = new Constructor();
  recognition.lang = "zh-CN";
  recognition.interimResults = false;
  recognition.maxAlternatives = alternatives;

  let settle: (result: ListenResult) => void = () => {};
  let done = false;
  const result = new Promise<ListenResult>((resolve) => {
    settle = (value) => {
      if (done) return; // le navigateur peut signaler plusieurs fins : seule la première compte
      done = true;
      clearTimeout(timer);
      resolve(value);
    };
  });

  const stop = (error: ListenError) => {
    settle({ heard: [], error });
    try {
      recognition.abort();
    } catch {
      // déjà arrêtée
    }
  };

  recognition.onresult = (event) => {
    const heard = Array.from(event.results[0] ?? [], (alternative) => alternative.transcript);
    settle({ heard, error: heard.length > 0 ? null : "silence" });
  };
  recognition.onerror = (event) => {
    const denied = event.error === "not-allowed" || event.error === "service-not-allowed";
    settle({ heard: [], error: denied ? "denied" : "silence" });
  };
  recognition.onend = () => settle({ heard: [], error: "silence" });

  const timer = setTimeout(() => stop("silence"), timeoutMs);
  try {
    recognition.start();
  } catch {
    settle({ heard: [], error: "silence" });
  }
  return { result, stop: () => stop("aborted") };
}
