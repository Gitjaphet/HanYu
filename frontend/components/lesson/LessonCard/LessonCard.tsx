"use client";

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

export function LessonCard({ lesson, starsEarned = 0, lessonNumber }: LessonCardProps) {
  const isCompleted = lesson.status === "completed";
  const isLocked    = lesson.status === "locked";
  const filledStars = Math.min(3, Math.max(0, starsEarned)); // 0 à 3, comme le quiz
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