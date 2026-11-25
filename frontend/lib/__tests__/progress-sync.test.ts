import { describe, expect, it } from "vitest";
import { emptyProgress, progressToImport, quizResult, type ProgressMap } from "@/lib/progress";
import { fromApi, toProgressMap } from "@/lib/progressApi";

describe("quizResult", () => {
  it("calcule étoiles et XP comme le serveur", () => {
    expect(quizResult(5, 0, 5)).toEqual({ stars: 3, xp: 50 });
    expect(quizResult(4, 1, 5)).toEqual({ stars: 2, xp: 40 });
  });

  it("3 erreurs : quiz raté, 0 étoile", () => {
    expect(quizResult(2, 3, 5).stars).toBe(0);
  });
});

describe("progressToImport", () => {
  const local: ProgressMap = {
    1: { ...emptyProgress(1), vocabDone: true },
    2: emptyProgress(2), // rien de fait : inutile à envoyer
  };

  it("envoie la progression d'un invité", () => {
    expect(progressToImport(local, null, 7).map((p) => p.lessonId)).toEqual([1]);
  });

  it("renvoie la progression du même compte (rattrapage hors ligne)", () => {
    expect(progressToImport(local, 7, 7)).toHaveLength(1);
  });

  it("n'envoie jamais la progression d'un autre compte", () => {
    expect(progressToImport(local, 3, 7)).toEqual([]);
  });
});

describe("fromApi / toProgressMap", () => {
  const row = { lessonId: 1, vocabDone: true, dialogueDone: true, quizDone: false, stars: 0, xp: 0, completedAt: null };

  it("retire completedAt quand il vaut null", () => {
    expect(fromApi(row)).not.toHaveProperty("completedAt");
  });

  it("indexe les lignes par leçon", () => {
    expect(toProgressMap([row])[1].vocabDone).toBe(true);
  });
});
