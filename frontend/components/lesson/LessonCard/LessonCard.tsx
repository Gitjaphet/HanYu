import Link from "next/link";
import { Lock, Play, RotateCcw, Star } from "lucide-react";
import { Lesson } from "@/types";
import styles from "./LessonCard.module.css";

interface LessonCardProps {
  lesson: Lesson;
  starsEarned?: number; /* 0 à 5 */
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
  const isLocked    = lesson.status === "locked";
  const isCompleted = lesson.status === "completed";

  /* starsEarned passé en prop, sinon fallback sur STARS_MAP, sinon 0 */
  const stars = starsEarned ?? STARS_MAP[lesson.id] ?? 0;

  /* 0–3 étoiles affichées converties depuis une note sur 5 */
  const filledStars = Math.round((stars / 5) * 3);

  /* Couleur dynamique : accent haut + hanzi/pinyin sur cartes locked/completed */
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
      aria-label={`Leçon ${lessonNumber ?? lesson.id} : ${lesson.title}`}
    >
      {/* ── Accent couleur en haut ── */}
      <div
        className={styles.colorAccent}
        style={{ background: accentColor }}
        aria-hidden="true"
      />

      {/* ── Blob décoratif coin supérieur droit ── */}
      <div
        className={styles.blob}
        style={{
          background: `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* ── En-tête ── */}
      <div className={styles.cardTop}>
        <span className={styles.lessonNum}>
          Leçon {lessonNumber ?? lesson.id}
        </span>

        {!isLocked && (
          <div
            className={styles.stars}
            aria-label={`${stars} étoile${stars !== 1 ? "s" : ""} sur 5`}
          >
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                size={14}
                className={[
                  styles.star,
                  s <= filledStars ? styles.starFilled : styles.starEmpty,
                ].join(" ")}
                aria-hidden="true"
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Caractères chinois + pinyin + traduction ── */}
      <div className={styles.cardBody}>
        <h2
          className={styles.hanzi}
          lang="zh"
          style={isLocked || isCompleted ? { color: accentColor } : undefined}
        >
          {lesson.chinese}
        </h2>

        <p
          className={styles.pinyin}
          style={isLocked || isCompleted ? { color: accentColor } : undefined}
        >
          {lesson.pinyin}
        </p>

        <p className={styles.title}>{lesson.title}</p>
      </div>

      {/* ── Module pills ── */}
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

      {/* ── Bouton d'action ── */}
      <div className={styles.cardFooter}>
        {isLocked ? (
          <div
            className={styles.btnLocked}
            aria-label="Leçon verrouillée"
          >
            <Lock size={15} aria-hidden="true" />
            <span>Verrouillé</span>
          </div>

        ) : isCompleted ? (
          <Link
            href={`/lesson/${lesson.id}`}
            className={[styles.btn, styles.btnReview].join(" ")}
          >
            <RotateCcw size={15} aria-hidden="true" />
            <span>Réviser</span>
          </Link>

        ) : (
          <Link
            href={`/lesson/${lesson.id}`}
            className={[styles.btn, styles.btnStart].join(" ")}
          >
            <Play size={15} fill="white" aria-hidden="true" />
            <span>Commencer</span>
          </Link>
        )}
      </div>
    </article>
  );
}