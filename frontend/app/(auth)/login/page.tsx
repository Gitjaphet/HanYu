// app/(auth)/login/page.tsx — connexion
"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthField } from "@/components/auth/AuthField";
import { safeNextPath } from "@/lib/auth";
import { useUserStore } from "@/store/userStore";

function LoginForm() {
  const router = useRouter();
  const next = safeNextPath(useSearchParams().get("next"));
  const login = useUserStore((s) => s.login);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    try {
      await login({ email: String(form.get("email")), password: String(form.get("password")) });
      router.replace(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connexion impossible");
      setPending(false);
    }
  }

  return (
    <>
      <h1 className="text-3xl font-black text-text mb-2">Bon retour 👋</h1>
      <p className="text-text-muted mb-8">Connecte-toi pour retrouver ta progression.</p>

      <form onSubmit={onSubmit} className="space-y-5">
        <AuthField id="email" name="email" type="email" label="E-mail" autoComplete="email" required />
        <div>
          <AuthField id="password" name="password" type="password" label="Mot de passe" autoComplete="current-password" required />
          <Link href="/forgot-password" className="mt-2 inline-block text-sm font-bold text-primary hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>

        {error && <p role="alert" className="text-sm font-bold text-danger">{error}</p>}

        <button type="submit" disabled={pending}
          className="w-full rounded-xl bg-primary py-3.5 font-bold text-white shadow-md transition hover:bg-primary-dark disabled:opacity-60">
          {pending ? "Connexion…" : "Se connecter"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-text-muted">
        Pas encore de compte ?{" "}
        <Link href={`/register${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-bold text-primary hover:underline">
          Créer un compte
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
