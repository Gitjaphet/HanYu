// components/lesson/LessonState/LessonState.tsx — écrans communs : chargement et leçon indisponible
import Link from "next/link";

export function LessonLoading() {
  return (
    <div className="flex items-center justify-center h-[100dvh] bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-text-muted font-bold text-sm">Chargement de la leçon…</p>
      </div>
    </div>
  );
}

export function LessonUnavailable({ error }: { error: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center h-[100dvh] bg-background p-4 text-center">
      <p className="text-text-muted font-bold mb-4">
        {error
          ? "Impossible de charger la leçon. Vérifie ta connexion."
          : "Cette leçon n'est pas encore disponible."}
      </p>
      <Link href="/" className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold shadow-md">
        Retour au tableau de bord
      </Link>
    </div>
  );
}
