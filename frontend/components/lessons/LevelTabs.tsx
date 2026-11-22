import Link from "next/link";

export type LevelTab = { code: string; label: string; done: number; total: number };

/** Onglets des niveaux A · B · C avec la progression de chacun. */
export function LevelTabs({ levels, active }: { levels: LevelTab[]; active: string }) {
  return (
    <nav aria-label="Niveaux" className="flex gap-1.5 rounded-2xl bg-tint p-1.5">
      {levels.map((lv) => {
        const on = lv.code === active;
        return (
          <Link
            key={lv.code}
            href={`/?level=${lv.code}`}
            aria-current={on ? "page" : undefined}
            className={`flex-1 min-w-0 flex items-center justify-center md:justify-start gap-2 md:gap-3 rounded-xl px-2 py-2 md:px-5 md:py-3 transition-colors ${
              on ? "bg-card text-text shadow-sm" : "text-text-muted hover:bg-card/60"
            }`}
          >
            <span
              className={`w-6 h-6 md:w-8 md:h-8 shrink-0 rounded-lg flex items-center justify-center text-xs md:text-sm font-extrabold ${
                on ? "bg-primary text-white" : "bg-card text-primary"
              }`}
            >
              {lv.code}
            </span>
            <span className="min-w-0 flex flex-col">
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
