import type { Lesson } from "@/types";
import { lessonStatus, type ProgressMap } from "@/lib/progress";
import { LessonRow } from "./LessonRow";

type Props = {
  number: number;
  title: string;
  unitLessons: Lesson[];
  /** Toutes les leçons du cursus, dans l'ordre : sert au verrouillage et à la numérotation. */
  allLessons: Lesson[];
  progress: ProgressMap;
  currentId: number | null;
};

/** Une unité : en-tête avec progression, puis la liste de ses leçons. */
export function UnitSection({ number, title, unitLessons, allLessons, progress, currentId }: Props) {
  const done = unitLessons.filter((l) => progress[l.id]?.quizDone).length;
  const total = unitLessons.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <section aria-labelledby={`unit-${number}`} className="rounded-3xl bg-card overflow-hidden">
      <header className="flex items-end md:items-center justify-between gap-4 px-4 pt-4 pb-3 md:px-6 md:py-5">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-xs font-extrabold tracking-widest text-primary">UNITÉ {number}</span>
          <h2 id={`unit-${number}`} className="text-lg md:text-xl font-extrabold text-text truncate">{title}</h2>
        </div>
        <div className="flex flex-col items-end gap-1.5 w-24 md:w-56 shrink-0">
          <span className="text-xs md:text-sm font-extrabold text-text-muted">{done} / {total} leçons</span>
          <span
            role="progressbar"
            aria-label={`Progression de l'unité ${number}`}
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            className="w-full h-2 rounded-full bg-tint overflow-hidden"
          >
            <span className="block h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
          </span>
        </div>
      </header>

      <ul className="divide-y divide-background border-t border-background p-1.5 md:p-2">
        {unitLessons.map((lesson) => (
          <li key={lesson.id}>
            <LessonRow
              lesson={lesson}
              number={allLessons.findIndex((l) => l.id === lesson.id) + 1}
              status={lessonStatus(allLessons, progress, lesson.id)}
              progress={progress[lesson.id]}
              current={lesson.id === currentId}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
