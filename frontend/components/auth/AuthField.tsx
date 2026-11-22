// components/auth/AuthField.tsx — champ de formulaire commun aux pages connexion / inscription
import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string };

export function AuthField({ label, hint, id, ...input }: Props) {
  return (
    <label htmlFor={id} className="block">
      <span className="block text-sm font-bold text-text mb-1.5">{label}</span>
      <input
        id={id}
        {...input}
        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      {hint && <span className="block text-xs text-text-muted mt-1">{hint}</span>}
    </label>
  );
}
