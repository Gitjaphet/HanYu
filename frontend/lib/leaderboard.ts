// lib/leaderboard.ts — le classement : appel à l'API et règles d'affichage (testées sans navigateur)
import { apiFetch } from "@/lib/api";

export type LeaderboardEntry = {
  rank: number;
  pseudo: string;
  xp: number;
  stars: number;
  lessons: number;
  isMe: boolean;
};

export type Leaderboard = {
  top: LeaderboardEntry[];
  me: LeaderboardEntry | null; // ma place, même si je ne suis pas dans le haut du classement
  total: number;
};

export const LEADERBOARD_SIZE = 20;

export function fetchLeaderboard(limit = LEADERBOARD_SIZE): Promise<Leaderboard> {
  return apiFetch<Leaderboard>(`/leaderboard?limit=${limit}`);
}

/** Ma ligne à ajouter sous le haut du classement : seulement si je suis classé mais pas déjà affiché. */
export function myExtraRow(board: Leaderboard): LeaderboardEntry | null {
  return board.me && !board.top.some((e) => e.isMe) ? board.me : null;
}

/** Couleur de la médaille des trois premiers (or, argent, bronze), aux couleurs du thème. */
export function medalTone(rank: number): string {
  if (rank === 1) return "bg-warning-soft text-warning";
  if (rank === 2) return "bg-tint text-secondary dark:text-primary";
  if (rank === 3) return "bg-tertiary/10 text-tertiary";
  return "bg-background text-text-muted";
}
