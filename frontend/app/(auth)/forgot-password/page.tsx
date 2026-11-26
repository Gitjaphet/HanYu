// app/(auth)/forgot-password/page.tsx — demander un lien pour changer de mot de passe
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import { AuthField } from "@/components/auth/AuthField";
import { forgotPassword } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email")).trim();
    setPending(true);
    setError(null);
    try {
      await forgotPassword(email);
      setSentTo(email);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Envoi impossible, réessaie dans un instant.");
    } finally {
      setPending(false);
    }
  }

  if (sentTo) {
    return (
      <div role="status">
        <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-tint text-primary">
          <MailCheck size={28} aria-hidden="true" />
        </span>
        <h1 className="text-3xl font-black text-text mb-3">Regarde tes e-mails</h1>
        <p className="text-text-muted">
          Si un compte existe pour <strong className="text-text break-all">{sentTo}</strong>, tu vas recevoir un lien
          pour choisir un nouveau mot de passe. Il est valable 30 minutes.
        </p>
        <p className="mt-4 text-sm text-text-muted">Rien reçu ? Vérifie le dossier Spam, ou recommence dans quelques minutes.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={() => setSentTo(null)}
            className="flex-1 rounded-xl bg-card py-3.5 font-bold text-primary ring-1 ring-inset ring-border transition hover:bg-tint">
            Changer d&apos;adresse
          </button>
          <Link href="/login"
            className="flex-1 rounded-xl bg-primary py-3.5 text-center font-bold text-white shadow-md transition hover:bg-primary-dark">
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Link href="/login" className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-text-muted hover:text-primary">
        <ArrowLeft size={16} aria-hidden="true" />
        Connexion
      </Link>
      <h1 className="text-3xl font-black text-text mb-2">Mot de passe oublié</h1>
      <p className="text-text-muted mb-8">Indique ton e-mail : on t&apos;envoie un lien pour en choisir un nouveau.</p>

      <form onSubmit={onSubmit} className="space-y-5">
        <AuthField id="email" name="email" type="email" label="E-mail" autoComplete="email" required autoFocus />

        {error && <p role="alert" className="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>}

        <button type="submit" disabled={pending}
          className="w-full rounded-xl bg-primary py-3.5 font-bold text-white shadow-md transition hover:bg-primary-dark disabled:opacity-60">
          {pending ? "Envoi…" : "Recevoir le lien"}
        </button>
      </form>
    </>
  );
}
