// components/games/GameIcon.tsx — l'icône de chaque jeu, aux couleurs du jeu
import { Gamepad2, Keyboard, Puzzle, type LucideIcon } from "lucide-react";
import type { GameInfo, GameSlug } from "@/lib/games";

const ICONS: Record<GameSlug, LucideIcon> = {
  "hanzi-hunt": Gamepad2,
  "speed-typing": Keyboard,
  "phrase-mystere": Puzzle,
};

export function GameIcon({ game, className = "" }: { game: GameInfo; className?: string }) {
  const Icon = ICONS[game.slug];
  return (
    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${game.tone} ${className}`}>
      <Icon size={24} aria-hidden="true" />
    </span>
  );
}
