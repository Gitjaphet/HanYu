// lib/api.ts — seul point de sortie vers le backend FastAPI

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Message lisible depuis une erreur FastAPI : texte simple, ou liste de champs invalides (422). */
function errorMessage(body: unknown, fallback: string): string {
  const detail = (body as { detail?: unknown } | null)?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as { loc?: unknown[]; msg?: string };
    const field = first.loc?.at(-1);
    return field ? `${String(field)} : ${first.msg ?? "valeur invalide"}` : (first.msg ?? fallback);
  }
  return fallback;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    // Envoie le cookie de session (indispensable en développement : le site et l'API
    // sont sur deux ports différents ; en production, même domaine)
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!response.ok) {
    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      // réponse sans JSON
    }
    throw new ApiError(response.status, errorMessage(body, response.statusText));
  }

  // 204 No Content (ex. déconnexion) : pas de corps à lire
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

/**
 * Partage une même requête entre tous les composants qui la demandent (accueil, menus…) :
 * un seul appel réseau par chargement de page. En cas d'échec, l'appel suivant réessaie.
 */
export function sharedRequest<T>(load: () => Promise<T>): () => Promise<T> {
  let pending: Promise<T> | null = null;
  return () => {
    pending ??= load().catch((error) => {
      pending = null;
      throw error;
    });
    return pending;
  };
}
