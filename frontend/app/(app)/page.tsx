"use client";

import { LessonCard } from "@/components/lesson/LessonCard/LessonCard";
import { useCurriculum, useLessons } from "@/hooks/useLessons";
import { useProgressStore } from "@/store/progressStore";
import { lessonStatus } from "@/lib/progress";
import { LessonLoading, LessonUnavailable } from "@/components/lesson/LessonState/LessonState";
import styles from "./page.module.css";

import { use } from "react";

export default  function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; unit?: string }>;
}) {
  const sp = use(searchParams);
  const activeLevel = sp.level || "A";
  const activeUnit  = sp.unit ? parseInt(sp.unit, 10) : 1;

  const { lessons, loading, error } = useLessons();
  const curriculum = useCurriculum();
  const meta = curriculum.data.find((lv) => lv.code === activeLevel);

  const lessonsForUnit = lessons.filter(
    l => l.levelId === activeLevel && l.unitId === activeUnit
  );
  const currentUnitTitle = lessonsForUnit[0]?.unitTitle ?? "";

  const progress = useProgressStore((s) => s.progress);
  const hydrated = useProgressStore((s) => s.hydrated);

  if (loading || curriculum.loading || !hydrated) return <LessonLoading label="Chargement des leçons…" />;
  if (error || curriculum.error) return <LessonUnavailable error={error ?? curriculum.error} />;

  return (
    <div className={styles.page}>

      {/* ══ HERO — carte flottante premium ══ */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <span className={styles.heroTag}>{meta?.tag}</span>
            <h1 className={styles.heroTitle}>
              <span className={styles.heroTitleOutline}>Niveau</span>
              <span className={styles.heroTitleSolid}>{activeLevel}</span>
            </h1>
            <p className={styles.heroSub}>{meta?.subtitle}</p>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.xpBox}>
              <span className={styles.xpLabel}>Objectif du jour</span>
              <span className={styles.xpValue}>
                0 <span className={styles.xpOf}>/ 50 XP</span>
              </span>
              <div className={styles.xpBar}>
                <div className={styles.xpFill} style={{ width: "0%" }} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ══ SECTION UNITÉ ══ */}
      <section className={styles.unitSection}>
        {lessonsForUnit.length > 0 ? (
          <>
            <div className={styles.unitHeader}>
              <div className={styles.unitBadge}>{activeUnit}</div>
              <div>
                <h2 className={styles.unitTitle}>Unité N°{activeUnit}</h2>
                <p className={styles.unitSub}>{currentUnitTitle}</p>
              </div>
            </div>

            <div className={styles.grid}>
                {lessonsForUnit.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  status={lessonStatus(lessons, progress, lesson.id)}
                  starsEarned={progress[lesson.id]?.stars ?? 0}
                />
              ))}
            </div>
          </>
        ) : (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>Bientôt disponible</p>
            <p className={styles.emptySub}>
              Les leçons pour l'Unité N°{activeUnit} — Niveau {activeLevel} arrivent bientôt.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}