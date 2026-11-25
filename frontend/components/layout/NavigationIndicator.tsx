"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

/**
 * Petit indicateur « Chargement… » en bas de l'écran pendant un changement de page (comme Odoo).
 * Il apparaît au clic sur un lien interne et disparaît quand la nouvelle page est affichée.
 * Il n'est visible qu'après 150 ms : une navigation instantanée ne le fait pas clignoter.
 */
export function NavigationIndicator() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const location = `${pathname}?${search}`;
  const [pending, setPending] = useState(false);
  const [shown, setShown] = useState(location);

  // La nouvelle page est affichée : fin du chargement (ajustement pendant le rendu)
  if (shown !== location) {
    setShown(location);
    setPending(false);
  }

  // Début : clic sur un lien vers une autre page du site
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; // nouvel onglet
      const link = (event.target as Element | null)?.closest("a");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      setPending(true);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Sécurité : jamais bloqué indéfiniment
  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => setPending(false), 10_000);
    return () => clearTimeout(timer);
  }, [pending]);

  return (
    <AnimatePresence>
      {pending && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.2 } }}
          exit={{ opacity: 0, y: 12, transition: { duration: 0.15 } }}
          className="fixed z-50 right-4 bottom-24 lg:right-6 lg:bottom-6 flex items-center gap-2.5 rounded-full bg-card text-text shadow-[var(--shadow-hover)] ring-1 ring-border px-4 py-2.5 text-sm font-bold"
        >
          <span
            aria-hidden="true"
            className="w-4 h-4 rounded-full border-2 border-tint border-t-primary animate-spin"
          />
          Chargement…
        </motion.div>
      )}
    </AnimatePresence>
  );
}
