import Link from "next/link";

/** Carte profil du panneau de droite (grand écran). */
export function ProfileCard({ pseudo, levelLabel }: { pseudo: string | null; levelLabel: string }) {
  const initials = (pseudo ?? "?").slice(0, 2).toUpperCase();
  return (
    <section className="hidden xl:flex flex-col items-center gap-2 rounded-3xl bg-card p-6 text-center">
      <span className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-3xl font-extrabold text-text">
        {initials}
      </span>
      <span className="mt-1 text-lg font-extrabold text-text">{pseudo ?? "Invité"}</span>
      <span className="text-sm font-bold text-text-muted">{levelLabel}</span>
      <Link
        href={pseudo ? "/profile" : "/login"}
        className="mt-2 rounded-full bg-primary hover:bg-primary-dark px-8 py-2.5 text-sm font-extrabold text-white transition active:scale-[0.98]"
      >
        {pseudo ? "Profil" : "Se connecter"}
      </Link>
    </section>
  );
}
