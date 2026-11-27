import { describe, expect, it } from "vitest";
import {
  GAMES, MEMORY_PAIRS, PHRASE_ROUNDS, TYPING_MIN_WORDS,
  buildMemoryDeck, checkTyping, findGame, isPhraseCorrect, parseLevel, parseMode,
  phraseTiles, pickPhrases, shuffleTiles, typingQueue,
} from "@/lib/games";
import type { DialogueLine, VocabItem } from "@/types";

const word = (i: number, hanzi = `字${i}`): VocabItem => ({ id: String(i), hanzi, pinyin: `zi${i}`, french: `mot ${i}` });
const line = (i: number, hanzi: string): DialogueLine => ({ id: String(i), speaker: "A", hanzi, pinyin: "", french: "" });

describe("catalogue", () => {
  it("chaque jeu a une adresse unique", () => {
    expect(new Set(GAMES.map((g) => g.slug)).size).toBe(GAMES.length);
    expect(findGame("inconnu")).toBeUndefined();
  });
  it("une valeur d'adresse inconnue retombe sur le défaut", () => {
    const hunt = findGame("hanzi-hunt")!;
    expect(parseLevel("B")).toBe("B");
    expect(parseLevel("Z")).toBe("A");
    expect(parseMode(hunt, "pinyin-fr")).toBe("pinyin-fr");
    expect(parseMode(hunt, "<script>")).toBe("hanzi-fr");
  });
});

describe("Hanzi Hunt", () => {
  it("6 paires, chacune avec ses deux faces selon le mode", () => {
    const deck = buildMemoryDeck(Array.from({ length: 10 }, (_, i) => word(i)), "hanzi-pinyin");
    expect(deck).toHaveLength(MEMORY_PAIRS * 2);
    for (const pair of new Set(deck.map((c) => c.pairId))) {
      const faces = deck.filter((c) => c.pairId === pair);
      expect(faces).toHaveLength(2);
      expect(faces.filter((c) => c.hanzi)).toHaveLength(1); // une face en hanzi, l'autre en pinyin
    }
    expect(new Set(deck.map((c) => c.id)).size).toBe(deck.length);
  });
  it("un mot présent dans deux leçons ne donne qu'une paire", () => {
    const deck = buildMemoryDeck([word(1, "你好"), word(2, "你好"), word(3, "谢谢")], "hanzi-fr");
    expect(deck).toHaveLength(4);
  });
});

describe("Phrase Mystère", () => {
  it("tuiles sans ponctuation, caractères répétés distincts", () => {
    const tiles = phraseTiles("谢谢，你！");
    expect(tiles.map((t) => t.char)).toEqual(["谢", "谢", "你"]);
    expect(new Set(tiles.map((t) => t.id)).size).toBe(3);
  });
  it("ne présente jamais la phrase déjà dans le bon ordre", () => {
    for (let n = 0; n < 200; n++) {
      const mixed = shuffleTiles(phraseTiles("我是学生"));
      expect(isPhraseCorrect(mixed, "我是学生")).toBe(false);
    }
  });
  it("vérifie l'ordre, ponctuation ignorée", () => {
    expect(isPhraseCorrect(phraseTiles("你好"), "你好！")).toBe(true);
    expect(isPhraseCorrect(phraseTiles("好你"), "你好")).toBe(false);
  });
  it("au plus 5 phrases, jamais d'une seule lettre", () => {
    const lines = [line(1, "好。"), ...Array.from({ length: 8 }, (_, i) => line(i + 2, "你好吗"))];
    const picked = pickPhrases(lines);
    expect(picked).toHaveLength(PHRASE_ROUNDS);
    expect(picked.every((l) => l.hanzi !== "好。")).toBe(true);
  });
});

describe("Speed Typing", () => {
  it("assez de mots pour une partie, même avec peu de vocabulaire", () => {
    expect(typingQueue([word(1), word(2), word(3)]).length).toBeGreaterThanOrEqual(TYPING_MIN_WORDS);
    expect(typingQueue([])).toEqual([]);
  });
  it("le pinyin en cours de saisie n'est pas une erreur", () => {
    expect(checkTyping("ni", "你好")).toBe("typing");
    expect(checkTyping("nihao", "你好")).toBe("typing");
    expect(checkTyping("你", "你好")).toBe("typing");
    expect(checkTyping("你 好", "你好")).toBe("correct");
    expect(checkTyping("你号", "你好")).toBe("wrong");
  });
});
