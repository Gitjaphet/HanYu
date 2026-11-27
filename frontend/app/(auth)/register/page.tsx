// app/(auth)/register/page.tsx — inscription (compte Community)
"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthField } from "@/components/auth/AuthField";
import { safeNextPath } from "@/lib/auth";
import { useUserStore } from "@/store/userStore";

function RegisterForm() {
  const router = useRouter();
  const next = safeNextPath(useSearchParams().get("next"));
  const register = useUserStore((s) => s.register);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    try {
      await register({
        email: String(form.get("email")),
        pseudo: String(form.get("pseudo")),
        password: String(form.get("password")),
      });
      router.replace(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Inscription impossible");
      setPending(false);
    }
  }

  return (
    <>
      <h1 className="text-3xl font-black text-text mb-2">Créer ton compte</h1>
      <p className="text-text-muted mb-8">Gratuit. Ta progression te suit sur tous tes appareils.</p>

      <form onSubmit={onSubmit} className="space-y-5">
        <AuthField id="pseudo" name="pseudo" label="Pseudo" autoComplete="nickname" required
          minLength={3} maxLength={30} hint="3 à 30 caractères, visible dans le classement." />
        <AuthField id="email" name="email" type="email" label="E-mail" autoComplete="email" required />
        <AuthField id="password" name="password" type="password" label="Mot de passe" autoComplete="new-password"
          required minLength={8} maxLength={128} hint="8 caractères minimum." />

        {error && <p role="alert" className="text-sm font-bold text-danger">{error}</p>}

        <button type="submit" disabled={pending}
          className="w-full rounded-xl bg-primary py-3.5 font-bold text-white shadow-md transition hover:bg-primary-dark disabled:opacity-60">
          {pending ? "Création…" : "Créer mon compte"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-text-muted">
        Déjà inscrit ?{" "}
        <Link href={`/login${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-bold text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
