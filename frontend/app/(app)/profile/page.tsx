// app/(app)/profile/page.tsx — le profil de l'élève : ses vraies données (compte, statistiques, progression)
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpenCheck, Settings, UserPlus } from "lucide-react";
import { useCurriculum, useLessons } from "@/hooks/useLessons";
import { useProgressStore } from "@/store/progressStore";
import { useUserStore } from "@/store/userStore";
import { countDone } from "@/lib/progress";
import { activeDays, streak, totals } from "@/lib/stats";
import { LessonUnavailable } from "@/components/lesson/LessonState/LessonState";
import { StatTiles } from "@/components/dashboard/StatTiles";
import { ActivityCalendar } from "@/components/dashboard/ActivityCalendar";

export default function ProfilePage() {
  const user = useUserStore((s) => s.user);
  const status = useUserStore((s) => s.status);
  const { lessons, loading, error } = useLessons();
  const curriculum = useCurriculum();
  const progress = useProgressStore((s) => s.progress);
  const hydrated = useProgressStore((s) => s.hydrated);
  const [today] = useState(() => new Date());
  const days = useMemo(() => activeDays(progress), [progress]);

  if (status === "loading" || loading || curriculum.loading || !hydrated) return <ProfileSkeleton />;
  if (error || curriculum.error) return <LessonUnavailable error={error ?? curriculum.error} />;

  const { xp, stars } = totals(progress);
  const done = countDone(lessons, progress);
  const levels = curriculum.data.map((level) => {
    const own = lessons.filter((l) => l.levelId === level.code);
    return { code: level.code, label: level.label, done: countDone(own, progress), total: own.length };
  });
  const pseudo = user?.pseudo ?? "Invité";
  const since = user ? new Date(user.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) : null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 sm:gap-6">
      {/* Identité */}
      <section className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card p-6 text-center shadow-sm sm:flex-row sm:text-left">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-3xl font-black text-white shadow-md">
          {pseudo.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-black text-text sm:text-3xl">{pseudo}</h1>
          {user ? (
            <>
              <p className="truncate text-sm font-medium text-text-muted">{user.email}</p>
              <p className="mt-1 text-xs font-bold text-text-muted first-letter:uppercase">Membre depuis {since}</p>
            </>
          ) : (
            <p className="text-sm font-medium text-text-muted">Ta progression est enregistrée sur cet appareil uniquement.</p>
          )}
        </div>
        {user ? (
          <Link href="/settings"
            className="flex items-center gap-2 rounded-full bg-tint px-5 py-2.5 text-sm font-extrabold text-primary transition hover:brightness-95">
            <Settings size={16} aria-hidden="true" /> Paramètres
          </Link>
        ) : (
          <Link href="/register"
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-primary-dark">
            <UserPlus size={16} aria-hidden="true" /> Créer un compte
          </Link>
        )}
      </section>

      <StatTiles streak={streak(days, today)} xp={xp} stars={stars} />

      {/* Progression par niveau */}
      <section aria-labelledby="levels-title" className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="levels-title" className="font-black text-text">Ma progression</h2>
          <span className="flex items-center gap-1.5 text-sm font-bold text-text-muted">
            <BookOpenCheck size={16} className="text-success" aria-hidden="true" />
            {done} leçon{done > 1 ? "s" : ""} terminée{done > 1 ? "s" : ""}
          </span>
        </div>
        <ul className="flex flex-col gap-4">
          {levels.map((level) => {
            const percent = level.total ? Math.round((level.done / level.total) * 100) : 0;
            return (
              <li key={level.code}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-bold text-text">Niveau {level.code} · {level.label}</span>
                  <span className="shrink-0 font-bold tabular-nums text-text-muted">{level.done} / {level.total}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-border" role="progressbar"
                  aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={`Niveau ${level.code}`}>
                  <div className={`h-full rounded-full transition-all duration-500 ${percent === 100 ? "bg-success" : "bg-primary"}`}
                    style={{ width: `${percent}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <ActivityCalendar days={days} today={today} />
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto flex max-w-3xl animate-pulse flex-col gap-4 sm:gap-6" aria-busy="true" aria-label="Chargement du profil">
      <div className="h-36 rounded-3xl bg-card" />
      <div className="h-24 rounded-3xl bg-card" />
      <div className="h-48 rounded-3xl bg-card" />
    </div>
  );
}
