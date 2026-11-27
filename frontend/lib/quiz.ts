// lib/quiz.ts — préparation d'un quiz : ordre des questions et des réponses tiré au hasard, sans biais.
import type { QuizQuestion } from "@/types";

/**
 * Mélange de Fisher-Yates : chaque ordre a exactement la même chance.
 * (`sort(() => Math.random() - 0.5)` favorise certains ordres et dépend du navigateur.)
 */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Questions dans un ordre aléatoire, chacune avec ses réponses mélangées. */
export function prepareQuiz(questions: readonly QuizQuestion[], random: () => number = Math.random): QuizQuestion[] {
  return shuffle(questions, random).map((q) => ({ ...q, options: shuffle(q.options, random) }));
}

/** Contient au moins un caractère chinois : on l'affiche alors avec la police des hanzi, plus grand. */
export function hasHanzi(text: string): boolean {
  return /\p{Script=Han}/u.test(text);
}

export function questionPrompt(q: QuizQuestion): string {
  switch (q.type) {
    case "hanzi-to-french": return `Que signifie ${q.hanzi} ?`;
    case "french-to-hanzi": return `Comment écrit-on « ${q.french} » ?`;
    case "pinyin-to-hanzi": return `Quel hanzi correspond à « ${q.pinyin} » ?`;
    case "audio": return "Écoute : que signifie ce mot ?";
    default: return q.hanzi;
  }
}

/** Aide sous la question (le pinyin), quand elle ne donne pas la réponse. */
export function questionHint(q: QuizQuestion): string {
  return q.type === "hanzi-to-french" ? q.pinyin : "";
}
