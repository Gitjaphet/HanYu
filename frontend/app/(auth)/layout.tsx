// app/(auth)/layout.tsx — pages connexion / inscription : panneau de marque (desktop) + formulaire
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] grid lg:grid-cols-2 bg-background">
      {/* Panneau de marque : visible seulement sur grand écran */}
      <aside className="hidden lg:flex flex-col justify-between p-12 bg-secondary text-white relative overflow-hidden">
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <span className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-xl font-bold">语</span>
          <span className="text-xl font-extrabold tracking-tight">HanYu</span>
        </Link>
        <div className="relative z-10">
          <p className="font-hanzi text-6xl mb-4">你好！</p>
          <p className="text-lg text-white/80 max-w-sm">
            Apprends le mandarin pas à pas : vocabulaire, dialogues, quiz et jeux.
          </p>
        </div>
        <span aria-hidden className="absolute -right-10 -bottom-16 font-hanzi text-[18rem] leading-none text-white/5 select-none">
          汉
        </span>
      </aside>

      {/* Formulaire : plein écran sur mobile, centré sur desktop */}
      <main className="flex flex-col justify-center px-5 py-10 sm:px-10">
        <Link href="/" className="lg:hidden flex items-center gap-2 mb-8 self-center">
          <span className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center text-lg font-bold">语</span>
          <span className="text-lg font-extrabold tracking-tight text-text">HanYu</span>
        </Link>
        <div className="w-full max-w-md mx-auto">{children}</div>
      </main>
    </div>
  );
}
