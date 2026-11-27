import { afterEach, describe, expect, it, vi } from "vitest";
import { canListen, listenOnce, matchesHanzi, normalizeHanzi } from "@/lib/speech";

describe("normalizeHanzi", () => {
  it("retire la ponctuation chinoise et latine", () => expect(normalizeHanzi("你好！ 我叫，小明。")).toBe("你好我叫小明"));
  it("retire les espaces", () => expect(normalizeHanzi(" 谢 谢 ")).toBe("谢谢"));
});

describe("matchesHanzi", () => {
  it("accepte si une des propositions correspond", () => expect(matchesHanzi(["你号", "你好。"], "你好！")).toBe(true));
  it("refuse sinon", () => expect(matchesHanzi(["你号"], "你好")).toBe(false));
  it("refuse une réponse attendue vide", () => expect(matchesHanzi([""], "！")).toBe(false));
});

// Faux moteur de reconnaissance : le test décide de ce que « le navigateur » entend
class FakeRecognition {
  static last: FakeRecognition | null = null;
  lang = "";
  interimResults = true;
  maxAlternatives = 1;
  onresult: ((e: { results: { transcript: string }[][] }) => void) | null = null;
  onerror: ((e: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;
  aborted = false;
  constructor() {
    FakeRecognition.last = this;
  }
  start() {}
  abort() {
    this.aborted = true;
    this.onend?.();
  }
}

describe("listenOnce", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("signale un navigateur sans reconnaissance", async () => {
    vi.stubGlobal("window", {});
    expect(canListen()).toBe(false);
    expect(await listenOnce().result).toEqual({ heard: [], error: "unsupported" });
  });

  it("rend toutes les interprétations entendues, en chinois", async () => {
    vi.stubGlobal("window", { webkitSpeechRecognition: FakeRecognition });
    const listening = listenOnce({ alternatives: 3 });
    const rec = FakeRecognition.last!;
    expect([rec.lang, rec.maxAlternatives, rec.interimResults]).toEqual(["zh-CN", 3, false]);
    rec.onresult?.({ results: [[{ transcript: "你好" }, { transcript: "你号" }]] });
    rec.onend?.(); // fin signalée après le résultat : ignorée
    expect(await listening.result).toEqual({ heard: ["你好", "你号"], error: null });
  });

  it("micro refusé", async () => {
    vi.stubGlobal("window", { SpeechRecognition: FakeRecognition });
    const listening = listenOnce();
    FakeRecognition.last!.onerror?.({ error: "not-allowed" });
    expect((await listening.result).error).toBe("denied");
  });

  it("silence au bout du délai : l'écoute est coupée", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("window", { SpeechRecognition: FakeRecognition });
    const listening = listenOnce({ timeoutMs: 1000 });
    vi.advanceTimersByTime(1000);
    expect((await listening.result).error).toBe("silence");
    expect(FakeRecognition.last!.aborted).toBe(true);
  });

  it("arrêt demandé par l'application", async () => {
    vi.stubGlobal("window", { SpeechRecognition: FakeRecognition });
    const listening = listenOnce();
    listening.stop();
    expect((await listening.result).error).toBe("aborted");
  });
});
