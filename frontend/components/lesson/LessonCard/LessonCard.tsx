"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Lock, Play, RotateCcw, Star } from "lucide-react";
import { Lesson } from "@/types";
import styles from "./LessonCard.module.css";

interface LessonCardProps {
  lesson: Lesson;
  starsEarned?: number;
  lessonNumber?: number;
}

const MODULE_MAP: Record<string, { label: string; cls: string }> = {
  flashcards: { label: "Flashcards", cls: styles.mpFlash    },
  tones:      { label: "Tons",       cls: styles.mpTone     },
  quiz:       { label: "Quiz",       cls: styles.mpQuiz     },
  writing:    { label: "Écriture",   cls: styles.mpWrite    },
  dialogue:   { label: "Dialogue",   cls: styles.mpDialogue },
  pairs:      { label: "Paires",     cls: styles.mpPairs    },
};

const STARS_MAP: Record<number, number> = {
  1: 5,
  2: 3,
};

export function LessonCard({ lesson, starsEarned, lessonNumber }: LessonCardProps) {
  // On utilise des états locaux pour pouvoir écraser MOCK_LESSONS avec le localStorage
  const [isCompleted, setIsCompleted] = useState(lesson.status === "completed");
  const [isLocked, setIsLocked] = useState(lesson.status === "locked");
  const [stars, setStars] = useState(starsEarned ?? STARS_MAP[lesson.id] ?? 0);

  useEffect(() => {
    // 1. Vérifier si CETTE leçon a été terminée (quizDone)
    const storedCurrent = localStorage.getItem(`lesson_progress_${lesson.id}`);
    if (storedCurrent) {
      const progress = JSON.parse(storedCurrent);
      if (progress.quizDone) {
        setIsCompleted(true);
        setIsLocked(false);
        if (progress.stars) setStars(progress.stars);
      }
    }

    // 2. Vérifier si la leçon PRÉCÉDENTE a été terminée pour déverrouiller celle-ci
    if (lesson.id > 1 && lesson.status === "locked") {
      const storedPrev = localStorage.getItem(`lesson_progress_${lesson.id - 1}`);
      if (storedPrev) {
        const prevProgress = JSON.parse(storedPrev);
        if (prevProgress.quizDone) {
          setIsLocked(false);
        }
      }
    }
  }, [lesson.id, lesson.status]);

  const filledStars = Math.round((stars / 5) * 3);
  const accentColor = lesson.color ?? "var(--color-primary)";

  return (
    <article
      className={[
        styles.card,
        isLocked    ? styles.locked    : "",
        isCompleted ? styles.completed : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={styles.colorAccent}
        style={{ background: accentColor }}
        aria-hidden="true"
      />

      <div
        className={styles.blob}
        style={{ background: `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)` }}
        aria-hidden="true"
      />

      <div className={styles.cardTop}>
        <span className={styles.lessonNum}>
          Leçon {lessonNumber ?? lesson.id}
        </span>

        {!isLocked && (
          <div className={styles.stars}>
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                size={14}
                className={[
                  styles.star,
                  s <= filledStars ? styles.starFilled : styles.starEmpty,
                ].join(" ")}
              />
            ))}
          </div>
        )}
      </div>

      <div className={styles.cardBody}>
        <h2
          className={styles.hanzi}
          lang="zh"
          style={isLocked || isCompleted ? { color: accentColor } : undefined}
        >
          {lesson.chinese}
        </h2>

        <p className={styles.pinyin} style={isLocked || isCompleted ? { color: accentColor } : undefined}>
          {lesson.pinyin}
        </p>

        <p className={styles.title}>{lesson.title}</p>
      </div>

      <div className={styles.pills}>
        {lesson.modules.map((mod) => {
          const m = MODULE_MAP[mod] ?? { label: mod, cls: styles.mpWrite };
          return (
            <span key={mod} className={[styles.pill, m.cls].join(" ")}>
              {m.label}
            </span>
          );
        })}
      </div>

      <div className={styles.cardFooter}>
        {isLocked ? (
          <div className={styles.btnLocked}>
            <Lock size={15} />
            <span>Verrouillé</span>
          </div>
        ) : isCompleted ? (
          <Link href={`/lesson/${lesson.id}`} className={[styles.btn, styles.btnReview].join(" ")}>
            <RotateCcw size={15} />
            <span>Réviser</span>
          </Link>
        ) : (
          <Link href={`/lesson/${lesson.id}`} className={[styles.btn, styles.btnStart].join(" ")}>
            <Play size={15} fill="white" />
            <span>Commencer</span>
          </Link>
        )}
      </div>
    </article>
  );
}