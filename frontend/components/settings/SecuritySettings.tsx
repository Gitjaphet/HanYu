"use client";

import { useState } from "react";
import { MonitorSmartphone } from "lucide-react";
import { logoutOthers } from "@/lib/auth";
import { useUserStore } from "@/store/userStore";

type State = "idle" | "pending" | "done" | "error";

/** Carte « Sécurité » des paramètres : visible uniquement pour un compte connecté. */
export function SecuritySettings() {
  const user = useUserStore((s) => s.user);
  const [state, setState] = useState<State>("idle");

  if (!user) return null;

  async function onClick() {
    setState("pending");
    try {
      await logoutOthers();
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="mb-10">
      <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3 ml-2">Sécurité</h2>
      <div className="bg-card border-2 border-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <MonitorSmartphone size={22} className="text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-bold text-text">Autres appareils</p>
            <p className="text-sm text-text-muted">
              Téléphone perdu, ordinateur partagé ? Ferme toutes les autres sessions. Cet appareil reste connecté.
            </p>
            <p role="status" className="text-sm font-bold mt-1">
              {state === "done" && <span className="text-tertiary">C&apos;est fait : tes autres appareils sont déconnectés.</span>}
              {state === "error" && <span className="text-accent">Impossible pour le moment, réessaie plus tard.</span>}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClick}
          disabled={state === "pending"}
          className="shrink-0 rounded-full bg-tint text-primary px-5 py-2.5 text-sm font-extrabold transition hover:brightness-95 active:scale-[0.98] disabled:opacity-60"
        >
          {state === "pending" ? "Déconnexion…" : "Déconnecter les autres"}
        </button>
      </div>
    </div>
  );
}
