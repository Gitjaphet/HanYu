// app/(app)/jeux/[game]/page.tsx — avant de jouer : consigne, niveau et (pour Hanzi Hunt) mode
"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { ChevronLeft, Play } from "lucide-react";
import { LEVELS, findGame, type Level, type MemoryMode } from "@/lib/games";
import { GameIcon } from "@/components/games/GameIcon";

export default function GameSetupPage() {
  const { game: slug } = useParams<{ game: string }>();
  const router = useRouter();
  const game = findGame(slug);
  const [level, setLevel] = useState<Level>("A");
  const [mode, setMode] = useState<MemoryMode>("hanzi-fr");

  if (!game) notFound();

  const start = () => {
    const query = new URLSearchParams({ level, ...(game.modes ? { mode } : {}) });
    router.push(`/jeux/${game.slug}/play?${query}`);
  };

  const choice = (active: boolean) =>
    `rounded-xl border-2 font-bold transition ${active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-text-muted hover:border-primary/40"}`;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link href="/jeux"
        className="-ml-3 inline-flex w-fit items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-text-muted transition hover:bg-tint hover:text-text">
        <ChevronLeft size={18} aria-hidden="true" /> Retour aux jeux
      </Link>

      <header className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:gap-5 sm:p-6">
        <GameIcon game={game} className="h-14 w-14" />
        <div>
          <h1 className="text-2xl font-black text-text sm:text-3xl">{game.title}</h1>
          <p className="mt-1 text-sm font-medium text-text-muted sm:text-base">{game.howTo}</p>
        </div>
      </header>

      <section aria-labelledby="level-title">
        <h2 id="level-title" className="mb-3 text-sm font-bold uppercase tracking-wider text-text-muted">
          {game.modes ? "1. " : ""}Choisis ton niveau
        </h2>
        <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-labelledby="level-title">
          {LEVELS.map((l) => (
            <button key={l} type="button" role="radio" aria-checked={level === l} onClick={() => setLevel(l)}
              className={`py-4 ${choice(level === l)}`}>
              Niveau {l}
            </button>
          ))}
        </div>
      </section>

      {game.modes && (
        <section aria-labelledby="mode-title">
          <h2 id="mode-title" className="mb-3 text-sm font-bold uppercase tracking-wider text-text-muted">2. Mode de jeu</h2>
          <div className="flex flex-col gap-3" role="radiogroup" aria-labelledby="mode-title">
            {game.modes.map((m) => (
              <button key={m.id} type="button" role="radio" aria-checked={mode === m.id} onClick={() => setMode(m.id)}
                className={`flex flex-col p-4 text-left ${choice(mode === m.id)}`}>
                <span className="font-bold">{m.label}</span>
                <span className="mt-1 text-xs font-medium opacity-80">{m.description}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <button type="button" onClick={start}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-white shadow-sm transition hover:bg-primary-dark active:scale-[0.98]">
        <Play size={20} aria-hidden="true" /> Commencer la partie
      </button>
    </div>
  );
}
