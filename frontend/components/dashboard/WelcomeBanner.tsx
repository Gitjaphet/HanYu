import Link from "next/link";
import { Play } from "lucide-react";
import type { Lesson } from "@/types";

type Props = {
  pseudo: string | null;
  next: Lesson | null;
  /** Ex. « Tu en es à la leçon 5 de l'unité « Se présenter ». » */
  message: string;
};

/** Bandeau de bienvenue : salutation, où en est l'élève, bouton pour reprendre. */
export function WelcomeBanner({ pseudo, next, message }: Props) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-card p-6 md:p-8 flex items-center gap-6">
      <div className="relative z-10 flex-1 min-w-0 flex flex-col items-start gap-3">
        <h1 className="text-2xl md:text-3xl font-extrabold text-text">
          <span className="font-hanzi">你好</span>
          {pseudo ? `, ${pseudo} !` : " !"}
        </h1>
        <p className="text-sm md:text-base text-text-muted max-w-lg">
          {message}{" "}
          <Link href="/lecons" className="font-extrabold text-primary hover:underline underline-offset-4">
            Voir le programme
          </Link>
        </p>
        {next && (
          <Link
            href={`/lesson/${next.id}`}
            className="mt-1 inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-dark px-6 py-3 text-sm font-extrabold text-white shadow-[var(--shadow-primary)] transition active:scale-[0.98]"
          >
            <Play size={14} className="fill-current" aria-hidden="true" />
            Reprendre · <span className="font-hanzi">{next.chinese}</span> {next.title}
          </Link>
        )}
      </div>

      {/* Visuel : les caractères de la prochaine leçon */}
      {next && (
        <div
          aria-hidden="true"
          className="hidden sm:flex shrink-0 w-44 h-36 md:w-56 md:h-40 rounded-3xl bg-gradient-to-br from-primary to-secondary flex-col items-center justify-center text-white"
        >
          <span className="font-hanzi text-5xl md:text-6xl leading-none">{next.chinese}</span>
          <span className="mt-2 text-sm font-bold opacity-90">{next.pinyin}</span>
        </div>
      )}
    </section>
  );
}
