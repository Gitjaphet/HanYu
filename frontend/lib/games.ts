// lib/games.ts — les jeux : catalogue (une seule source pour l'accueil, la configuration et le jeu)
// et leur logique pure (paquets de cartes, tuiles de phrases, file de mots), testée sans navigateur.
import { hasHanzi, shuffle } from "@/lib/quiz";
import { normalizeHanzi } from "@/lib/speech";
import type { DialogueLine, VocabItem } from "@/types";

export const LEVELS = ["A", "B", "C"] as const;
export type Level = (typeof LEVELS)[number];

export type GameSlug = "hanzi-hunt" | "speed-typing" | "phrase-mystere";
export type MemoryMode = "hanzi-fr" | "pinyin-fr" | "hanzi-pinyin";

export type GameInfo = {
  slug: GameSlug;
  title: string;
  pitch: string;        // une phrase pour la carte de l'accueil des jeux
  howTo: string;        // consigne affichée avant de jouer
  tone: string;         // couleurs du thème propres au jeu (icône, sélection)
  modes?: { id: MemoryMode; label: string; description: string }[];
};

export const GAMES: readonly GameInfo[] = [
  {
    slug: "hanzi-hunt",
    title: "Hanzi Hunt",
    pitch: "Entraîne ta mémoire : retrouve les paires de cartes avant la fin du temps.",
    howTo: "Retourne les cartes deux par deux et retrouve chaque paire en 45 secondes.",
    tone: "bg-primary/10 text-primary",
    modes: [
      { id: "hanzi-fr", label: "汉字 → Français", description: "Le plus facile, idéal pour débuter" },
      { id: "pinyin-fr", label: "Pinyin → Français", description: "Renforce la lecture" },
      { id: "hanzi-pinyin", label: "汉字 → Pinyin", description: "Plus difficile" },
    ],
  },
  {
    slug: "speed-typing",
    title: "Speed Typing",
    pitch: "Lis le français et le pinyin, puis tape le hanzi le plus vite possible.",
    howTo: "Active un clavier chinois (pinyin). Chaque bonne réponse ajoute 3 secondes.",
    tone: "bg-warning-soft text-warning",
  },
  {
    slug: "phrase-mystere",
    title: "Phrase Mystère",
    pitch: "Remets les caractères d'une phrase du dialogue dans le bon ordre.",
    howTo: "5 phrases, 3 vies : tapote les caractères dans l'ordre pour reconstruire la phrase.",
    tone: "bg-tertiary/10 text-tertiary",
  },
];

export function findGame(slug: string): GameInfo | undefined {
  return GAMES.find((g) => g.slug === slug);
}

/** Paramètres d'adresse vérifiés : une valeur inconnue retombe sur le choix par défaut. */
export function parseLevel(value: string | null): Level {
  return LEVELS.find((l) => l === value) ?? "A";
}
export function parseMode(game: GameInfo, value: string | null): MemoryMode {
  return game.modes?.find((m) => m.id === value)?.id ?? "hanzi-fr";
}

// ── Hanzi Hunt : un paquet de paires ──

export type MemoryCard = { id: string; pairId: string; text: string; hanzi: boolean };

export const MEMORY_PAIRS = 6;

export function buildMemoryDeck(
  words: readonly VocabItem[],
  mode: MemoryMode,
  random: () => number = Math.random,
): MemoryCard[] {
  const faces = (w: VocabItem): [string, string] =>
    mode === "pinyin-fr" ? [w.pinyin, w.french] : mode === "hanzi-pinyin" ? [w.hanzi, w.pinyin] : [w.hanzi, w.french];
  // Deux mots identiques dans deux leçons donneraient deux paires indiscernables : un seul exemplaire
  const unique = [...new Map(words.map((w) => [w.hanzi, w])).values()];
  const cards = shuffle(unique, random)
    .slice(0, MEMORY_PAIRS)
    .flatMap((w, i): MemoryCard[] => {
      const [a, b] = faces(w);
      return [
        { id: `${i}-a`, pairId: String(i), text: a, hanzi: hasHanzi(a) },
        { id: `${i}-b`, pairId: String(i), text: b, hanzi: hasHanzi(b) },
      ];
    });
  return shuffle(cards, random);
}

// ── Phrase Mystère : des tuiles à remettre dans l'ordre ──

export type Tile = { id: string; char: string };

export const PHRASE_ROUNDS = 5;

/** Les caractères de la phrase, sans ponctuation ; chaque tuile a son identifiant (caractères répétés). */
export function phraseTiles(hanzi: string): Tile[] {
  return [...normalizeHanzi(hanzi)].map((char, i) => ({ id: `${i}-${char}`, char }));
}

/** Mélange des tuiles, en évitant de les présenter déjà dans le bon ordre (si c'est possible). */
export function shuffleTiles(tiles: readonly Tile[], random: () => number = Math.random): Tile[] {
  const answer = tiles.map((t) => t.char).join("");
  const distinct = new Set(tiles.map((t) => t.char)).size > 1;
  for (let attempt = 0; attempt < 10; attempt++) {
    const mixed = shuffle(tiles, random);
    if (!distinct || mixed.map((t) => t.char).join("") !== answer) return mixed;
  }
  return [...tiles].reverse();
}

export function isPhraseCorrect(chosen: readonly Tile[], hanzi: string): boolean {
  return chosen.map((t) => t.char).join("") === normalizeHanzi(hanzi);
}

/** Phrases tirées au hasard parmi les dialogues, en écartant celles d'un seul caractère (rien à ordonner). */
export function pickPhrases(lines: readonly DialogueLine[], random: () => number = Math.random): DialogueLine[] {
  return shuffle(lines.filter((l) => normalizeHanzi(l.hanzi).length > 1), random).slice(0, PHRASE_ROUNDS);
}

// ── Speed Typing : une file de mots, et la vérification de la saisie ──

export const TYPING_MIN_WORDS = 20;

/** Assez de mots pour toute une partie : la liste est remélangée et répétée si elle est courte. */
export function typingQueue(words: readonly VocabItem[], random: () => number = Math.random): VocabItem[] {
  if (words.length === 0) return [];
  const queue: VocabItem[] = [];
  while (queue.length < TYPING_MIN_WORDS) queue.push(...shuffle(words, random));
  return queue;
}

export type TypingCheck = "correct" | "wrong" | "typing";

/**
 * Pendant la saisie au clavier chinois, le champ contient d'abord du pinyin (« ni ») avant les hanzi :
 * ce n'est une erreur que si des hanzi sont écrits et qu'il y en a déjà autant (ou plus) que la réponse.
 */
export function checkTyping(value: string, expected: string): TypingCheck {
  const typed = normalizeHanzi(value);
  const target = normalizeHanzi(expected);
  if (typed === target) return "correct";
  if (hasHanzi(typed) && [...typed].length >= [...target].length) return "wrong";
  return "typing";
}
