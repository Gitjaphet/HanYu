// app/(app)/jeux/page.tsx — l'accueil des jeux, construit à partir du catalogue
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { GAMES } from "@/lib/games";
import { GameIcon } from "@/components/games/GameIcon";
import PandaMascot from "@/components/lesson/PandaMascot/PandaMascot";

export default function GamesPage() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:gap-6 sm:p-8">
        <div className="h-28 w-28 shrink-0 sm:h-32 sm:w-32">
          <PandaMascot state="success" />
        </div>
        <div className="text-center sm:text-left">
          <h1 className="mb-2 text-3xl font-black text-text sm:text-4xl">Jeux</h1>
          <p className="text-base font-medium text-text-muted sm:text-lg">
            Révise ton vocabulaire en t&apos;amusant : choisis un jeu.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((game) => (
          <Link key={game.slug} href={`/jeux/${game.slug}`}
            className="group flex flex-col rounded-2xl border-2 border-border bg-card p-5 shadow-sm transition hover:border-primary/50 hover:shadow-md active:scale-[0.98] sm:p-6">
            <GameIcon game={game} className="mb-4 transition-transform group-hover:scale-110" />
            <h2 className="mb-1 text-xl font-bold text-text">{game.title}</h2>
            <p className="flex-1 text-sm text-text-muted">{game.pitch}</p>
            <span className="mt-4 flex items-center gap-1 text-sm font-bold text-primary">
              Jouer <ChevronRight size={16} aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
