export type Theme = "light" | "dark";

export const THEME_KEY = "hanyu-theme";

/** Choix enregistré par l'utilisateur, sinon réglage du système. */
export function resolveTheme(stored: string | null, prefersDark: boolean): Theme {
  if (stored === "light" || stored === "dark") return stored;
  return prefersDark ? "dark" : "light";
}

/**
 * Script lancé dans <head> avant l'affichage de la page :
 * il pose data-theme tout de suite, sinon la page clignoterait
 * en clair avant de passer en sombre.
 */
export const themeScript = `(function(){try{var s=localStorage.getItem("${THEME_KEY}");var t=s==="light"||s==="dark"?s:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=t}catch(e){}})()`;

export function readTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // stockage bloqué (navigation privée) : le thème vaut pour cette visite
  }
}
