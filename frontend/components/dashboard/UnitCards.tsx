import Link from "next/link";
import { Lock } from "lucide-react";
import type { UnitCard } from "@/lib/stats";

const STYLE = {
  done: "bg-gradient-to-br from-secondary to-primary text-white",
  current: "bg-gradient-to-br from-primary to-[#8A7BCB] text-white",
  locked: "bg-card text-text-muted ring-1 ring-inset ring-border",
} as const;

/** « Mes unités » : cartes des unités autour de celle en cours. */
export function UnitCards({ units }: { units: UnitCard[] }) {
  return (
    <section aria-labelledby="units-title" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 id="units-title" className="text-lg font-extrabold text-text">Mes unités</h2>
        <Link href="/lecons" className="text-sm font-extrabold text-primary hover:underline underline-offset-4">
          Tout voir
        </Link>
      </div>

      <div className="-mx-3 px-3 md:mx-0 md:px-0 flex md:grid md:grid-cols-3 gap-3 overflow-x-auto hide-scrollbar snap-x">
        {units.map((u) => {
          const pct = Math.round((u.done / u.total) * 100);
          return (
            <Link
              key={`${u.level}-${u.number}`}
              href={`/lecons?level=${u.level}`}
              className={`snap-start shrink-0 w-[72%] sm:w-[45%] md:w-auto min-h-36 rounded-3xl p-5 flex flex-col gap-1 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)] active:scale-[0.98] ${STYLE[u.state]}`}
            >
              <span className="text-[11px] font-extrabold tracking-widest opacity-90">
                NIVEAU {u.level} · UNITÉ {u.number}
              </span>
              <span className={`text-lg font-extrabold ${u.state === "locked" ? "text-text" : ""}`}>{u.title}</span>
              <span className="mt-auto flex flex-col gap-2">
                {u.state === "locked" ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold">
                    <Lock size={14} aria-hidden="true" /> Verrouillée
                  </span>
                ) : (
                  <>
                    <span className="text-xs font-bold">
                      {u.done} / {u.total} leçons · {u.state === "done" ? "terminée" : "en cours"}
                    </span>
                    <span className="h-1.5 rounded-full bg-white/30 overflow-hidden">
                      <span className="block h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
                    </span>
                  </>
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
