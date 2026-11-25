// app/(auth)/layout.tsx — pages connexion / inscription : panneau de marque (desktop) + formulaire
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
        <div className="w-full max-w-md mx-auto">
          {children}

          {/* Mode invité : rien n'est enregistré sur le serveur, tout reste dans ce navigateur */}
          <div className="mt-8 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-text-muted">
            <span className="h-px flex-1 bg-border" />
            ou
            <span className="h-px flex-1 bg-border" />
          </div>
          <Link
            href="/lecons"
            className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-card py-3.5 font-bold text-primary ring-1 ring-inset ring-border transition hover:bg-tint active:scale-[0.98]"
          >
            Essayer sans compte
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <p className="mt-3 text-center text-xs text-text-muted">
            Ta progression restera sur cet appareil. Crée un compte quand tu veux : elle te suivra.
          </p>
        </div>
      </main>
    </div>
  );
}
