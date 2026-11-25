"use client";

import { useMemo, useState } from "react";
import { useCurriculum, useLessons } from "@/hooks/useLessons";
import { useProgressStore } from "@/store/progressStore";
import { useUserStore } from "@/store/userStore";
import { countDone, nextLesson } from "@/lib/progress";
import { activeDays, reviewWords, streak, totals, unitCards, unitWindow } from "@/lib/stats";
import { LessonUnavailable } from "@/components/lesson/LessonState/LessonState";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { UnitCards } from "@/components/dashboard/UnitCards";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { StatTiles } from "@/components/dashboard/StatTiles";
import { ActivityCalendar } from "@/components/dashboard/ActivityCalendar";
import { ReviewWords } from "@/components/dashboard/ReviewWords";

export default function DashboardPage() {
  const { lessons, loading, error } = useLessons();
  const curriculum = useCurriculum();
  const progress = useProgressStore((s) => s.progress);
  const hydrated = useProgressStore((s) => s.hydrated);
  const pseudo = useUserStore((s) => s.user?.pseudo ?? null);
  const [today] = useState(() => new Date());

  const days = useMemo(() => activeDays(progress), [progress]);

  if (loading || curriculum.loading || !hydrated) return <DashboardSkeleton />;
  if (error || curriculum.error) return <LessonUnavailable error={error ?? curriculum.error} />;

  const next = nextLesson(lessons, progress);
  const { xp, stars } = totals(progress);
  const levelCode = next?.levelId ?? curriculum.data.at(-1)?.code ?? "A";
  const levelLessons = lessons.filter((l) => l.levelId === levelCode);
  const remaining = levelLessons.length - countDone(levelLessons, progress);

  // L'élève a-t-il déjà commencé quelque chose ? La leçon proposée est-elle entamée ?
  const started = Object.values(progress).some((p) => p.vocabDone || p.dialogueDone || p.quizDone);
  const current = next ? progress[next.id] : undefined;
  const stepsLeft = current
    ? [!current.vocabDone && "le vocabulaire", !current.dialogueDone && "le dialogue", !current.quizDone && "le quiz"].filter(Boolean)
    : [];
  const inProgress = stepsLeft.length > 0 && stepsLeft.length < 3;

  let message: string;
  let ctaLabel = "Leçon suivante";
  if (!next) {
    message = "Bravo, tu as terminé toutes les leçons disponibles !";
  } else if (!started) {
    message = "Bienvenue ! Commence ta première leçon de mandarin, elle ne prend que quelques minutes.";
    ctaLabel = "Commencer";
  } else if (inProgress) {
    message = `Tu es en pleine leçon « ${next.title} » : il te reste ${stepsLeft.join(" et ")}.`;
    ctaLabel = "Continuer";
  } else {
    const position = levelLessons.findIndex((l) => l.id === next.id) + 1;
    message = `Prochaine étape : la leçon ${position} de l'unité « ${next.unitTitle} ». Encore ${remaining} leçon${remaining > 1 ? "s" : ""} pour terminer le niveau ${levelCode}.`;
  }

  const dateLabel = today.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">
      {/* ── Colonne principale ── */}
      <div className="flex flex-col gap-6 min-w-0">
        <p className="text-sm font-bold text-text-muted first-letter:uppercase">{dateLabel}</p>
        <WelcomeBanner pseudo={pseudo} next={next} message={message} ctaLabel={ctaLabel} />
        <UnitCards units={unitWindow(unitCards(curriculum.data, lessons, progress))} />
      </div>

      {/* ── Panneau : à droite sur grand écran, en dessous sinon ── */}
      <aside aria-label="Mon espace" className="mt-6 xl:mt-0 grid md:grid-cols-2 xl:grid-cols-1 gap-4 xl:sticky xl:top-8">
        <ProfileCard pseudo={pseudo} levelLabel={`Élève · Niveau ${levelCode}`} />
        <div className="flex flex-col gap-4">
          <StatTiles streak={streak(days, today)} xp={xp} stars={stars} />
          <ReviewWords words={reviewWords(lessons, progress)} />
        </div>
        <ActivityCalendar days={days} today={today} />
      </aside>
    </div>
  );
}
