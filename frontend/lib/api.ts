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

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = await response.json();
      if (typeof body?.detail === "string") message = body.detail;
    } catch {
      // réponse sans JSON : on garde le statusText
    }
    throw new ApiError(response.status, message);
  }

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
