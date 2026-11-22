"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, useLenis } from "lenis/react";
import { MotionConfig } from "motion/react";

/** Remonte en haut de page à chaque changement de page (pas lors d'un changement d'onglet ?level=). */
function ScrollToTopOnRouteChange() {
  const pathname = usePathname();
  const lenis = useLenis();
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true });
  }, [pathname, lenis]);
  return null;
}

/**
 * Défilement fluide (Lenis) et réglages communs des animations (Motion).
 * - Lenis lisse la molette et le pavé tactile ; sur téléphone, le défilement natif est gardé.
 * - Si l'utilisateur a demandé « réduire les animations » dans son système, tout devient instantané.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, anchors: true, stopInertiaOnNavigate: true }}>
      <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 420, damping: 36 }}>
        <ScrollToTopOnRouteChange />
        {children}
      </MotionConfig>
    </ReactLenis>
  );
}
