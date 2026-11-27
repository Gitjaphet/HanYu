// components/games/HanziHunt.tsx — jeu de mémoire : retrouver les paires avant la fin du temps
"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { buildMemoryDeck, type MemoryCard, type MemoryMode } from "@/lib/games";
import { useCountdown } from "@/hooks/useCountdown";
import { GameOver } from "@/components/games/shared/GameOver";
import { GameShell, TimerBadge } from "@/components/games/shared/GameShell";
import type { VocabItem } from "@/types";

const TIME_LIMIT = 45;
const SHOW_PAIR_MS = 500;    // une paire trouvée reste visible un instant
const SHOW_MISTAKE_MS = 1100; // deux cartes différentes : le temps de les mémoriser

type Props = { words: VocabItem[]; mode: MemoryMode; level: string; onBack: () => void; onQuit: () => void };

export function HanziHunt(props: Props) {
  const [game, setGame] = useState({ round: 0, attempt: 1 });
  return (
    <MemoryRound
      key={game.round}
      {...props}
      attempt={game.attempt}
      onRetry={() => setGame((g) => ({ round: g.round + 1, attempt: g.attempt + 1 }))}
      onReplay={() => setGame((g) => ({ round: g.round + 1, attempt: 1 }))}
    />
  );
}

function MemoryRound({ words, mode, level, attempt, onBack, onQuit, onRetry, onReplay }: Props & {
  attempt: number;
  onRetry: () => void;  // après une défaite : essai suivant
  onReplay: () => void; // après une victoire : nouvelle partie
}) {
  const [deck] = useState(() => buildMemoryDeck(words, mode));
  const [revealed, setRevealed] = useState<string[]>([]); // cartes retournées (2 au plus)
  const [matched, setMatched] = useState<string[]>([]);   // paires trouvées
  const [moves, setMoves] = useState(0);
  const pending = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const won = deck.length > 0 && matched.length * 2 === deck.length;
  const timer = useCountdown(TIME_LIMIT, !won);
  const lost = timer.over && !won;

  useEffect(() => () => clearTimeout(pending.current), []);

  const flip = (card: MemoryCard) => {
    if (lost || revealed.length === 2 || revealed.includes(card.id) || matched.includes(card.pairId)) return;
    const next = [...revealed, card.id];
    setRevealed(next);
    if (next.length < 2) return;

    setMoves((m) => m + 1);
    const [a, b] = next.map((id) => deck.find((c) => c.id === id)!);
    const same = a.pairId === b.pairId;
    pending.current = setTimeout(() => {
      if (same) setMatched((m) => [...m, a.pairId]);
      setRevealed([]);
    }, same ? SHOW_PAIR_MS : SHOW_MISTAKE_MS);
  };

  return (
    <GameShell title="Hanzi Hunt" subtitle={`Niveau ${level} · Essai n°${attempt}`} onBack={onBack}
      right={<TimerBadge seconds={timer.left} />}>
      {deck.length < 4 ? (
        <p className="m-auto text-center font-bold text-text-muted">Pas encore assez de mots dans ce niveau pour jouer.</p>
      ) : won ? (
        <GameOver won title="Gagné !" onRetry={onReplay} onQuit={onQuit}>
          Toutes les paires en <strong className="text-text">{moves} coups</strong>
          {attempt > 1 && <> et <strong className="text-text">{attempt} essais</strong></>}, avec {timer.left} s d&apos;avance.
        </GameOver>
      ) : lost ? (
        <GameOver won={false} title="Temps écoulé !" retryLabel={`Réessayer (essai n°${attempt + 1})`} onRetry={onRetry} onQuit={onQuit}>
          {matched.length} paire{matched.length > 1 ? "s" : ""} sur {deck.length / 2}. Ne lâche rien, tu y es presque !
        </GameOver>
      ) : (
        <div className="m-auto grid w-full max-w-lg grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3">
          {deck.map((card) => (
            <FlipCard key={card.id} card={card}
              faceUp={revealed.includes(card.id) || matched.includes(card.pairId)}
              found={matched.includes(card.pairId)}
              onFlip={() => flip(card)} />
          ))}
        </div>
      )}
    </GameShell>
  );
}

function FlipCard({ card, faceUp, found, onFlip }: { card: MemoryCard; faceUp: boolean; found: boolean; onFlip: () => void }) {
  return (
    <button type="button" onClick={onFlip} disabled={faceUp}
      aria-label={faceUp ? card.text : "Carte cachée"}
      className="aspect-square w-full [perspective:800px]">
      <motion.span animate={{ rotateY: faceUp ? 180 : 0 }} transition={{ duration: 0.4 }}
        className="relative block h-full w-full [transform-style:preserve-3d]">
        {/* Dos */}
        <span className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-primary/20 bg-primary/10 shadow-sm transition-colors [backface-visibility:hidden] hover:bg-primary/20">
          <span className="font-hanzi text-3xl text-primary/30" aria-hidden="true">汉</span>
        </span>
        {/* Face */}
        <span className={`absolute inset-0 flex items-center justify-center rounded-xl border-2 p-2 shadow-md [backface-visibility:hidden] [transform:rotateY(180deg)] ${
          found ? "border-success bg-success-soft text-success" : "border-secondary bg-card text-text dark:border-primary"}`}>
          <span className={`break-words text-center font-bold leading-tight ${card.hanzi ? "font-hanzi text-2xl sm:text-3xl" : "text-sm sm:text-base"}`}>
            {card.text}
          </span>
        </span>
      </motion.span>
    </button>
  );
}
