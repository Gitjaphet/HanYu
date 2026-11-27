// components/games/PhraseMystere.tsx — remettre dans l'ordre les caractères d'une phrase du dialogue
"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Volume2 } from "lucide-react";
import { HEARTS } from "@/lib/progress";
import { isPhraseCorrect, phraseTiles, pickPhrases, shuffleTiles, type Tile } from "@/lib/games";
import { speak } from "@/lib/speech";
import { GameOver } from "@/components/games/shared/GameOver";
import { GameShell, HeartsBadge } from "@/components/games/shared/GameShell";
import PandaMascot from "@/components/lesson/PandaMascot/PandaMascot";
import type { DialogueLine } from "@/types";

type Props = { lines: DialogueLine[]; level: string; onBack: () => void; onQuit: () => void };

export function PhraseMystere(props: Props) {
  const [round, setRound] = useState(0);
  return <PhraseGame key={round} {...props} onReplay={() => setRound((r) => r + 1)} />;
}

function PhraseGame({ lines, level, onBack, onQuit, onReplay }: Props & { onReplay: () => void }) {
  const [phrases] = useState(() => pickPhrases(lines));
  const [idx, setIdx] = useState(0);
  const [hearts, setHearts] = useState(HEARTS);

  const won = phrases.length > 0 && idx >= phrases.length;
  const lost = hearts <= 0;

  return (
    <GameShell title="Phrase Mystère" subtitle={`Niveau ${level} · Phrase ${Math.min(idx + 1, phrases.length)} / ${phrases.length}`}
      onBack={onBack} right={<HeartsBadge left={hearts} total={HEARTS} />}>
      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-border" role="progressbar"
        aria-valuenow={idx} aria-valuemin={0} aria-valuemax={phrases.length} aria-label="Progression">
        <div className="h-full rounded-full bg-tertiary transition-all duration-500"
          style={{ width: `${phrases.length ? (idx / phrases.length) * 100 : 0}%` }} />
      </div>

      {phrases.length === 0 ? (
        <p className="m-auto text-center font-bold text-text-muted">Pas encore de dialogue dans ce niveau.</p>
      ) : lost ? (
        <GameOver won={false} title="Plus de vies !" retryLabel="Réessayer" onRetry={onReplay} onQuit={onQuit}>
          L&apos;ordre des mots en chinois demande un peu de pratique : réessaie !
        </GameOver>
      ) : won ? (
        <GameOver won title="Parfait !" onRetry={onReplay} onQuit={onQuit}>
          Tu as reconstruit les {phrases.length} phrases, avec {hearts} vie{hearts > 1 ? "s" : ""} restante{hearts > 1 ? "s" : ""}.
        </GameOver>
      ) : (
        <PhraseRound key={idx} line={phrases[idx]}
          onWrong={() => setHearts((h) => h - 1)}
          onSolved={() => setIdx((i) => i + 1)} />
      )}
    </GameShell>
  );
}

type Status = "idle" | "success" | "error";

function PhraseRound({ line, onWrong, onSolved }: { line: DialogueLine; onWrong: () => void; onSolved: () => void }) {
  const [pool, setPool] = useState<Tile[]>(() => shuffleTiles(phraseTiles(line.hanzi)));
  const [chosen, setChosen] = useState<Tile[]>([]);
  const [status, setStatus] = useState<Status>("idle");

  const pick = (tile: Tile) => {
    if (status === "success") return;
    setStatus("idle");
    setPool((p) => p.filter((t) => t.id !== tile.id));
    setChosen((c) => [...c, tile]);
  };

  const unpick = (tile: Tile) => {
    if (status === "success") return;
    setStatus("idle");
    setChosen((c) => c.filter((t) => t.id !== tile.id));
    setPool((p) => [...p, tile]);
  };

  const check = () => {
    if (isPhraseCorrect(chosen, line.hanzi)) {
      setStatus("success");
      void speak(line.hanzi);
    } else {
      setStatus("error");
      onWrong();
    }
  };

  const tile = "min-h-12 min-w-12 rounded-xl px-4 py-2.5 font-hanzi text-2xl font-bold shadow-sm transition active:scale-95";

  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="mb-2 scale-75 sm:scale-90">
        <PandaMascot state={status === "success" ? "success" : status === "error" ? "fail" : "idle"} />
      </div>

      <div className="mb-6 w-full rounded-2xl border-2 border-border bg-card p-4 text-center shadow-sm sm:p-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-text-muted">Comment dit-on :</p>
        <p className="text-xl font-bold text-text sm:text-2xl">« {line.french} »</p>
        {status === "success" && (
          <button type="button" onClick={() => void speak(line.hanzi)}
            className="mx-auto mt-2 flex items-center gap-1.5 text-sm font-bold text-tertiary">
            <Volume2 size={14} aria-hidden="true" /> {line.pinyin}
          </button>
        )}
      </div>

      {/* Phrase en construction */}
      <div aria-label="Ta phrase"
        className={`mb-6 flex min-h-20 w-full flex-wrap items-center justify-center gap-2 border-b-2 border-dashed pb-4 transition-colors ${
          status === "error" ? "border-danger" : status === "success" ? "border-success" : "border-border"}`}>
        {chosen.length === 0 && <span className="text-sm text-text-muted">Tapote les caractères dans l&apos;ordre</span>}
        {chosen.map((t) => (
          <motion.button key={t.id} type="button" onClick={() => unpick(t)} layout
            animate={status === "error" ? { x: [0, -6, 6, -3, 3, 0] } : { x: 0 }}
            aria-label={`Retirer ${t.char}`}
            className={`${tile} border ${
              status === "success" ? "border-success bg-success-soft text-success"
              : status === "error" ? "border-danger bg-danger-soft text-danger"
              : "border-border bg-card text-text hover:bg-tint"}`}>
            {t.char}
          </motion.button>
        ))}
      </div>

      {/* Caractères disponibles */}
      <div className="mb-8 flex w-full flex-wrap justify-center gap-3" aria-label="Caractères à placer">
        {pool.map((t) => (
          <motion.button key={t.id} type="button" onClick={() => pick(t)} layout
            className={`${tile} border-2 border-border bg-card text-text hover:border-tertiary`}>
            {t.char}
          </motion.button>
        ))}
      </div>

      <div className="mt-auto w-full pb-[env(safe-area-inset-bottom)]" role="status" aria-live="polite">
        {status === "error" && (
          <p className="mb-3 text-center font-bold text-danger">Ce n&apos;est pas le bon ordre : retire des caractères et réessaie.</p>
        )}
        {status === "success" ? (
          <button type="button" onClick={onSolved} autoFocus
            className="w-full rounded-xl bg-success py-4 font-bold text-white shadow-sm transition hover:brightness-110 active:scale-[0.98]">
            Continuer
          </button>
        ) : (
          <button type="button" onClick={check} disabled={pool.length > 0 || status === "error"}
            className="w-full rounded-xl bg-tertiary py-4 font-bold text-white shadow-sm transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-border disabled:text-text-muted">
            Vérifier
          </button>
        )}
      </div>
    </div>
  );
}
