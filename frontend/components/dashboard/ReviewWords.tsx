import Link from "next/link";
import type { ReviewWord } from "@/lib/stats";

/** Les derniers mots appris, à revoir. */
export function ReviewWords({ words }: { words: ReviewWord[] }) {
  return (
    <section aria-labelledby="review-title" className="rounded-3xl bg-card p-5 flex flex-col gap-3">
      <h2 id="review-title" className="text-base font-extrabold text-text">À réviser</h2>
      {words.length === 0 ? (
        <p className="text-sm text-text-muted">
          Termine ta première leçon : ses mots apparaîtront ici.{" "}
          <Link href="/lecons" className="font-extrabold text-primary hover:underline underline-offset-4">Commencer</Link>
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {words.map((w) => (
            <li key={w.id} className="flex items-center gap-3">
              <span className="w-16 h-12 shrink-0 rounded-2xl bg-background flex items-center justify-center font-hanzi text-lg text-text whitespace-nowrap">
                {w.hanzi}
              </span>
              <span className="min-w-0 flex flex-col">
                <span className="text-sm font-extrabold text-text truncate">{w.pinyin} · {w.french}</span>
                <span className="text-xs text-text-muted truncate">{w.lessonTitle}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
