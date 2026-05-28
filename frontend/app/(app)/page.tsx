"use client";

import { LessonCard } from "@/components/lesson/LessonCard/LessonCard";
import { MOCK_LESSONS, LEVEL_META } from "../../lib/constants";
import styles from "./page.module.css";

import { use, useEffect, useState } from "react";

export default  function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; unit?: string }>;
}) {
  const sp = use(searchParams);
  const activeLevel = sp.level || "A";
  const activeUnit  = sp.unit ? parseInt(sp.unit, 10) : 1;

  const meta = LEVEL_META[activeLevel] ?? LEVEL_META["A"];

  const lessonsForUnit = MOCK_LESSONS.filter(
    l => l.levelId === activeLevel && l.unitId === activeUnit
  );
  const currentUnitTitle = lessonsForUnit[0]?.unitTitle ?? "";

  const [completedIds, setCompletedIds] = useState<number[]>([]);

  useEffect(() => {
    // Au chargement, on lit les leçons terminées dans la mémoire du navigateur
    const stored = localStorage.getItem("completedLessons");
    if (stored) {
      setCompletedIds(JSON.parse(stored));
    }
  }, []);

  // On recalcule le statut dynamiquement pour chaque carte
  // On recalcule le statut dynamiquement en vérifiant la progression GLOBALE
  const dynamicLessons = lessonsForUnit.map((lesson) => {
    const isCompleted = completedIds.includes(lesson.id);
    
    // 💡 On cherche l'index de cette leçon dans tout le cursus (MOCK_LESSONS)
    const globalIndex = MOCK_LESSONS.findIndex(l => l.id === lesson.id);
    const previousGlobalLesson = MOCK_LESSONS[globalIndex - 1];
    
    // La leçon qui précède (même si elle est dans une autre unité/niveau) est-elle finie ?
    const isPreviousCompleted = previousGlobalLesson ? completedIds.includes(previousGlobalLesson.id) : false;

    let dynamicStatus = lesson.status;
    if (isCompleted) {
      dynamicStatus = 'completed'; // Bouton "RÉVISER"
    } else if (lesson.id === 1 || isPreviousCompleted) {
      dynamicStatus = 'available'; // Bouton "COMMENCER"
    } else {
      dynamicStatus = 'locked';    // Cadenas
    }

    return { ...lesson, status: dynamicStatus };
  });

  return (
    <div className={styles.page}>

      {/* ══ HERO — carte flottante premium ══ */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <span className={styles.heroTag}>{meta.tag}</span>
            <h1 className={styles.heroTitle}>
              <span className={styles.heroTitleOutline}>Niveau</span>
              <span className={styles.heroTitleSolid}>{activeLevel}</span>
            </h1>
            <p className={styles.heroSub}>{meta.subtitle}</p>
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
                {dynamicLessons.map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson as any} starsEarned={0} />
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