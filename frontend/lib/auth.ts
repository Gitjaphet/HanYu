// lib/auth.ts — comptes : inscription, connexion, déconnexion, « qui suis-je ? »

import type { User } from "@/types";
import { ApiError, apiFetch } from "@/lib/api";

export type RegisterData = { email: string; pseudo: string; password: string };
export type LoginData = { email: string; password: string };

export function register(data: RegisterData): Promise<User> {
  return apiFetch<User>("/auth/register", { method: "POST", body: JSON.stringify(data) });
}

export function login(data: LoginData): Promise<User> {
  return apiFetch<User>("/auth/login", { method: "POST", body: JSON.stringify(data) });
}

export function logout(): Promise<void> {
  return apiFetch<void>("/auth/logout", { method: "POST" });
}

/** Le compte connecté, ou null si personne n'est connecté. */
export async function getMe(): Promise<User | null> {
  try {
    return await apiFetch<User>("/auth/me");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

/** Adresse de retour après connexion : uniquement un chemin interne (évite les redirections piégées). */
export function safeNextPath(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

/** Déconnecte tous les autres appareils ; celui-ci reçoit un nouveau cookie et reste connecté. */
export function logoutOthers(): Promise<void> {
  return apiFetch<void>("/auth/logout-others", { method: "POST" });
}
