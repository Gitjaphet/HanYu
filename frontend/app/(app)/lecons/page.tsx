"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import { motion } from "motion/react";
import { useCurriculum, useLessons } from "@/hooks/useLessons";
import { useProgressStore } from "@/store/progressStore";
import { countDone, nextLesson } from "@/lib/progress";
import { LessonUnavailable } from "@/components/lesson/LessonState/LessonState";
import { LessonsSkeleton } from "@/components/lessons/LessonsSkeleton";
import { LevelTabs } from "@/components/lessons/LevelTabs";
import { UnitSection } from "@/components/lessons/UnitSection";

export default function LessonsPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const { level } = use(searchParams);
  const { lessons, loading, error } = useLessons();
  const curriculum = useCurriculum();
  const progress = useProgressStore((s) => s.progress);
  const hydrated = useProgressStore((s) => s.hydrated);

  // Sens du glissement quand on change de niveau : vers la gauche si on avance (A → B), vers la droite sinon
  const levelIndex = Math.max(0, curriculum.data.findIndex((lv) => lv.code === level));
  const [previous, setPrevious] = useState({ index: levelIndex, direction: 0 });
  if (previous.index !== levelIndex) {
    setPrevious({ index: levelIndex, direction: levelIndex > previous.index ? 1 : -1 });
  }

  if (loading || curriculum.loading || !hydrated) return <LessonsSkeleton />;
  if (error || curriculum.error) return <LessonUnavailable error={error ?? curriculum.error} />;

  const levels = curriculum.data;
  const active = levels.find((lv) => lv.code === level) ?? levels[0];
  const next = nextLesson(lessons, progress);

  const tabs = levels.map((lv) => {
    const levelLessons = lessons.filter((l) => l.levelId === lv.code);
    return { code: lv.code, label: lv.label, done: countDone(levelLessons, progress), total: levelLessons.length };
  });

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-text">Leçons</h1>
          {active && (
            <p className="text-sm md:text-[15px] text-text-muted">
              Niveau {active.code} · {active.label} — {active.subtitle}
            </p>
          )}
        </div>
        {next && (
          <Link
            href={`/lesson/${next.id}`}
            className="hidden md:inline-flex items-center gap-2 self-start md:self-auto rounded-full bg-primary hover:bg-primary-dark px-6 py-3 text-sm font-extrabold text-white shadow-[var(--shadow-primary)]"
          >
            <Play size={14} className="fill-current" aria-hidden="true" />
            Reprendre : {next.title}
          </Link>
        )}
      </header>

      {active && <LevelTabs levels={tabs} active={active.code} />}

      <motion.div
        key={active?.code}
        initial={{ opacity: 0, x: previous.direction * 32 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col gap-5 md:gap-6"
      >
      {active && active.units.length > 0 ? (
        active.units.map((unit) => (
          <UnitSection
            key={unit.number}
            number={unit.number}
            title={unit.title}
            unitLessons={unit.lessonIds
              .map((id) => lessons.find((l) => l.id === id))
              .filter((l) => l !== undefined)}
            allLessons={lessons}
            progress={progress}
            currentId={next?.id ?? null}
          />
        ))
      ) : (
        <div className="rounded-3xl bg-card px-6 py-12 text-center">
          <p className="text-lg font-extrabold text-text">Bientôt disponible</p>
          <p className="mt-1 text-sm text-text-muted">
            Les leçons du niveau {active?.code} arrivent bientôt.
          </p>
        </div>
      )}
      </motion.div>
    </div>
  );
}
