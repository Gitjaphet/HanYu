// app/(app)/settings/page.tsx — paramètres : uniquement des réglages qui fonctionnent vraiment
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronRight, KeyRound, LogOut, UserPlus } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { useUserStore } from "@/store/userStore";

export default function SettingsPage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);
  const [leaving, setLeaving] = useState(false);

  const signOut = () => {
    setLeaving(true);
    void logout().then(() => router.replace("/login"));
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <h1 className="text-3xl font-black text-text sm:text-4xl">Paramètres</h1>

      <Section title="Apparence">
        <div className="flex items-center justify-between gap-4 p-4">
          <div>
            <p className="font-bold text-text">Thème</p>
            <p className="text-sm text-text-muted">Clair ou sombre. Par défaut, HanYu suit le réglage de ton appareil.</p>
          </div>
          <ThemeToggle withLabel />
        </div>
      </Section>

      {user ? (
        <>
          <Section title="Mon compte">
            <Row label="Pseudo" value={user.pseudo} />
            <Row label="E-mail" value={user.email} />
            <Link href="/forgot-password"
              className="flex items-center justify-between gap-4 p-4 transition hover:bg-tint">
              <span className="flex items-center gap-3">
                <KeyRound size={20} className="shrink-0 text-primary" aria-hidden="true" />
                <span>
                  <span className="block font-bold text-text">Changer de mot de passe</span>
                  <span className="block text-sm text-text-muted">Tu reçois un lien par e-mail pour en choisir un nouveau.</span>
                </span>
              </span>
              <ChevronRight size={20} className="shrink-0 text-text-muted" aria-hidden="true" />
            </Link>
          </Section>

          <SecuritySettings />

          <button type="button" onClick={signOut} disabled={leaving}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-danger/30 bg-danger-soft py-4 font-bold text-danger transition hover:brightness-95 disabled:opacity-60">
            <LogOut size={18} aria-hidden="true" /> {leaving ? "Déconnexion…" : "Se déconnecter"}
          </button>
        </>
      ) : (
        <Section title="Mon compte">
          <div className="flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-muted">
              Tu utilises HanYu sans compte : ta progression reste sur cet appareil. Crée un compte pour la retrouver partout.
            </p>
            <Link href="/register"
              className="flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-primary-dark">
              <UserPlus size={16} aria-hidden="true" /> Créer un compte
            </Link>
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 ml-2 text-sm font-bold uppercase tracking-wider text-text-muted">{title}</h2>
      <div className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border-2 border-border bg-card shadow-sm">
        {children}
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <span className="font-bold text-text">{label}</span>
      <span className="min-w-0 truncate text-sm text-text-muted">{value}</span>
    </div>
  );
}
