"use client";

import { useSyncExternalStore, type MouseEvent } from "react";
import { Moon, Sun } from "lucide-react";
import { applyTheme, readTheme, type Theme } from "@/lib/theme";

// On observe l'attribut data-theme de <html> : tous les boutons
// de la page restent synchronisés, quel que soit celui qu'on clique.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

/**
 * Change de thème avec un cercle qui s'agrandit depuis le bouton cliqué.
 * Navigateur sans View Transitions, ou animations réduites : changement direct.
 */
function switchTheme(next: Theme, event: MouseEvent<HTMLButtonElement>) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduce) {
    applyTheme(next);
    return;
  }

  const rect = event.currentTarget.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  const transition = document.startViewTransition(() => applyTheme(next));
  transition.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 520, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" }
    );
  });
}

export function ThemeToggle({ withLabel = false }: { withLabel?: boolean }) {
  // null côté serveur : le thème n'est connu que dans le navigateur
  const theme = useSyncExternalStore<Theme | null>(subscribe, readTheme, () => null);
  const isDark = theme === "dark";
  const label = isDark ? "Mode clair" : "Mode sombre";

  return (
    <button
      type="button"
      onClick={(e) => switchTheme(isDark ? "light" : "dark", e)}
      aria-label={withLabel ? undefined : label}
      title={label}
      className="inline-flex items-center gap-2 rounded-full bg-tint text-primary px-3 h-9 text-sm font-bold transition hover:brightness-95 active:scale-95"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
      {withLabel && <span>{theme ? label : "Thème"}</span>}
    </button>
  );
}
