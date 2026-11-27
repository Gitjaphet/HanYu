import { describe, expect, it } from "vitest";
import { medalTone, myExtraRow, type Leaderboard, type LeaderboardEntry } from "@/lib/leaderboard";

const entry = (rank: number, pseudo: string, isMe = false): LeaderboardEntry =>
  ({ rank, pseudo, xp: 100 - rank, stars: 0, lessons: 1, isMe });

describe("myExtraRow", () => {
  it("rien à ajouter pour un visiteur", () => {
    expect(myExtraRow({ top: [entry(1, "Mei")], me: null, total: 1 })).toBeNull();
  });
  it("rien à ajouter si je suis déjà dans le haut", () => {
    const me = entry(1, "Moi", true);
    expect(myExtraRow({ top: [me], me, total: 1 })).toBeNull();
  });
  it("ma ligne en plus si je suis classé plus bas", () => {
    const me = entry(37, "Moi", true);
    const board: Leaderboard = { top: [entry(1, "Mei"), entry(2, "Bao")], me, total: 40 };
    expect(myExtraRow(board)).toBe(me);
  });
});

describe("medalTone", () => {
  it("or, argent, bronze, puis neutre", () => {
    expect(new Set([1, 2, 3].map(medalTone)).size).toBe(3);
    expect(medalTone(4)).toBe(medalTone(50));
  });
});
