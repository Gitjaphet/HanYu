"use client";

import { motion } from "motion/react";

/**
 * Un template est recréé à chaque changement de page (contrairement au layout) :
 * chaque page arrive donc avec un léger fondu + glissement vers le haut.
 */
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
