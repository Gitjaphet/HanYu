// proxy.ts — s'exécute sur le serveur avant l'affichage d'une page (anciennement « middleware »).
import { NextResponse, type NextRequest } from "next/server";

/** Cookie de session posé par l'API (backend/app/core/security.py). */
const SESSION_COOKIE = "hanyu_session";

/**
 * Pour l'instant, l'adresse principale mène à la connexion si personne n'est connecté.
 * Plus tard, « / » affichera la page vitrine (SEO) et le tableau de bord passera sur /app.
 */
export function proxy(request: NextRequest) {
  if (!request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/", // uniquement la page d'accueil : le reste du site n'est pas concerné
};
