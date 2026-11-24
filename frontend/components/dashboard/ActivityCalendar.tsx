"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { localDay } from "@/lib/stats";

const WEEKDAYS = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

/** Calendrier du mois : les jours avec une leçon terminée sont surlignés, aujourd'hui est mis en avant. */
export function ActivityCalendar({ days, today }: { days: Set<string>; today: Date }) {
  const [offset, setOffset] = useState(0);
  const month = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const title = month.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const lead = (month.getDay() + 6) % 7; // lundi = 0
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const todayKey = localDay(today);

  return (
    <section aria-label="Calendrier d'activité" className="rounded-3xl bg-card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setOffset((o) => o - 1)}
          aria-label="Mois précédent"
          className="w-8 h-8 rounded-lg ring-1 ring-inset ring-border text-text flex items-center justify-center hover:bg-background"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        <span className="text-sm font-extrabold text-text first-letter:uppercase">{title}</span>
        <button
          type="button"
          onClick={() => setOffset((o) => o + 1)}
          disabled={offset >= 0}
          aria-label="Mois suivant"
          className="w-8 h-8 rounded-lg ring-1 ring-inset ring-border text-text flex items-center justify-center hover:bg-background disabled:opacity-30"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[13px]">
        {WEEKDAYS.map((d) => (
          <span key={d} className="py-1 font-bold text-text-muted">{d}</span>
        ))}
        {Array.from({ length: lead }, (_, i) => <span key={`x${i}`} />)}
        {Array.from({ length: count }, (_, i) => {
          const key = localDay(new Date(month.getFullYear(), month.getMonth(), i + 1));
          const isToday = key === todayKey;
          const active = days.has(key);
          return (
            <span
              key={key}
              className={`py-1.5 rounded-lg ${
                isToday
                  ? "bg-primary text-white font-extrabold"
                  : active
                    ? "bg-tint text-text font-extrabold"
                    : "text-text"
              }`}
            >
              {i + 1}
              {active && <span className="sr-only"> (leçon terminée)</span>}
            </span>
          );
        })}
      </div>
    </section>
  );
}
