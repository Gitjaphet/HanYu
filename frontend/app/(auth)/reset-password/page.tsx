// app/(auth)/reset-password/page.tsx — choisir un nouveau mot de passe depuis le lien reçu par e-mail
"use client";

import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { AuthField } from "@/components/auth/AuthField";
import { readResetToken, verifyResetToken } from "@/lib/auth";
import { useUserStore } from "@/store/userStore";

const MIN_LENGTH = 8;

// Le jeton est après « # » dans l'adresse : il n'est jamais envoyé au serveur web,
// seul le navigateur le lit. Côté serveur (pré-rendu), il est encore inconnu : undefined.
function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}
const readToken = () => readResetToken(window.location.hash);
const noTokenYet = () => undefined;

export default function ResetPasswordPage() {
  const router = useRouter();
  const token = useSyncExternalStore(subscribe, readToken, noTokenYet);
  const resetPassword = useUserStore((s) => s.resetPassword);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [pending, setPending] = useState(false);
  // Résultat de la vérification du lien à l'ouverture (pour quel jeton, et s'il est encore valable)
  const [checked, setChecked] = useState<{ token: string; valid: boolean } | null>(null);

  useEffect(() => {
    if (!token) return;
    let active = true;
    verifyResetToken(token)
      .then((valid) => active && setChecked({ token, valid }))
      // API injoignable : on affiche le formulaire, l'envoi dira si le lien est valable
      .catch(() => active && setChecked({ token, valid: true }));
    return () => {
      active = false;
    };
  }, [token]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    if (password !== String(form.get("confirm"))) {
      setError("Les deux mots de passe ne sont pas identiques.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await resetPassword(token, password);
      // replace : l'adresse avec le jeton disparaît aussi de l'historique du navigateur
      router.replace("/");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Changement impossible, réessaie.";
      setExpired(message.includes("expiré"));
      setError(message);
      setPending(false);
    }
  }

  const checking = token === undefined || (token !== null && checked?.token !== token);
  if (checking) return <div className="h-80" aria-busy="true" aria-label="Vérification du lien…" />;

  if (token === null || expired || !checked?.valid) {
    return (
      <div role="alert">
        <h1 className="text-3xl font-black text-text mb-3">Lien invalide</h1>
        <p className="text-text-muted">
          Ce lien a expiré, a déjà servi, ou il est incomplet. Les liens ne fonctionnent qu&apos;une fois, pendant 30 minutes.
        </p>
        <Link href="/forgot-password"
          className="mt-8 block w-full rounded-xl bg-primary py-3.5 text-center font-bold text-white shadow-md transition hover:bg-primary-dark">
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  return (
    <>
      <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-tint text-primary">
        <KeyRound size={28} aria-hidden="true" />
      </span>
      <h1 className="text-3xl font-black text-text mb-2">Nouveau mot de passe</h1>
      <p className="text-text-muted mb-8">Choisis-en un que tu n&apos;utilises nulle part ailleurs.</p>

      <form onSubmit={onSubmit} className="space-y-5">
        <AuthField id="password" name="password" type="password" label="Nouveau mot de passe"
          autoComplete="new-password" minLength={MIN_LENGTH} maxLength={128} required autoFocus
          hint={`${MIN_LENGTH} caractères minimum`} />
        <AuthField id="confirm" name="confirm" type="password" label="Confirme le mot de passe"
          autoComplete="new-password" minLength={MIN_LENGTH} maxLength={128} required />

        {error && <p role="alert" className="text-sm font-bold text-danger">{error}</p>}

        <button type="submit" disabled={pending}
          className="w-full rounded-xl bg-primary py-3.5 font-bold text-white shadow-md transition hover:bg-primary-dark disabled:opacity-60">
          {pending ? "Enregistrement…" : "Changer le mot de passe"}
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-text-muted">Tous tes autres appareils seront déconnectés.</p>
    </>
  );
}
