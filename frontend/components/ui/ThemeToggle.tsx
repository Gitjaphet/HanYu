"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { applyTheme, readTheme, type Theme } from "@/lib/theme";

// On observe l'attribut data-theme de <html> : tous les boutons
// de la page restent synchronisés, quel que soit celui qu'on clique.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

export function ThemeToggle({ withLabel = false }: { withLabel?: boolean }) {
  // null côté serveur : le thème n'est connu que dans le navigateur
  const theme = useSyncExternalStore<Theme | null>(subscribe, readTheme, () => null);
  const isDark = theme === "dark";
  const label = isDark ? "Mode clair" : "Mode sombre";

  return (
    <button
      type="button"
      onClick={() => applyTheme(isDark ? "light" : "dark")}
      aria-label={withLabel ? undefined : label}
      title={label}
      className="inline-flex items-center gap-2 rounded-full bg-tint text-primary px-3 h-9 text-sm font-bold hover:brightness-95 transition"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
      {withLabel && <span>{theme ? label : "Thème"}</span>}
    </button>
  );
}
