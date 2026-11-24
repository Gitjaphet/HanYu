"use client";

import Link from "next/link";
import { motion } from "motion/react";

export type LevelTab = { code: string; label: string; done: number; total: number };

/**
 * Onglets des niveaux A · B · C avec la progression de chacun.
 * Le fond blanc de l'onglet actif glisse d'un onglet à l'autre (layoutId).
 */
export function LevelTabs({ levels, active }: { levels: LevelTab[]; active: string }) {
  return (
    <nav aria-label="Niveaux" className="flex gap-1.5 rounded-2xl bg-tint p-1.5">
      {levels.map((lv) => {
        const on = lv.code === active;
        return (
          <Link
            key={lv.code}
            href={`/lecons?level=${lv.code}`}
            scroll={false}
            aria-current={on ? "page" : undefined}
            className={`relative flex-1 min-w-0 flex items-center justify-center md:justify-start gap-2 md:gap-3 rounded-xl px-2 py-2 md:px-5 md:py-3 transition-colors duration-200 ${
              on ? "text-text" : "text-text-muted hover:text-text"
            }`}
          >
            {on && (
              <motion.span
                layoutId="level-tab-pill"
                aria-hidden="true"
                className="absolute inset-0 rounded-xl bg-card shadow-sm"
              />
            )}
            <span
              className={`relative w-6 h-6 md:w-8 md:h-8 shrink-0 rounded-lg flex items-center justify-center text-xs md:text-sm font-extrabold transition-colors duration-200 ${
                on ? "bg-primary text-white" : "bg-card text-primary"
              }`}
            >
              {lv.code}
            </span>
            <span className="relative min-w-0 flex flex-col">
              <span className="text-xs md:text-sm font-extrabold truncate">{lv.label}</span>
              <span className="hidden md:block text-xs font-bold text-text-muted">
                {lv.total > 0 ? `${lv.done} / ${lv.total} leçons` : "Bientôt"}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
