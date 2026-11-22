import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { ProgressHydrator } from "@/components/providers/ProgressHydrator";
import styles from "./layout.module.css";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.appShell}>
      <ProgressHydrator />

      {/* ═══ BLOBS DÉCORATIFS ═══ */}
      <div className={styles.blobs} aria-hidden="true">
        <div className={`${styles.blob} ${styles.blob1}`} />
        <div className={`${styles.blob} ${styles.blob2}`} />
        <div className={`${styles.blob} ${styles.blob3}`} />
        <div className={`${styles.blob} ${styles.blob4}`} />
        <div className={`${styles.blob} ${styles.blob5}`} />
      </div>

      {/* Sidebar — visible uniquement ≥ md via hidden md:flex interne */}
      <Sidebar />

      {/* Contenu principal */}
      <main className="flex-1 lg:ml-72 pb-28 lg:pb-10 min-h-screen">
        {/* Rappelle-toi tes réglages px et pt précédents ici */}
        <div className="max-w-5xl mx-auto w-full pt-5 px-2 md:pt-8 md:px-4">
          {children}
        </div>
      </main>

      {/* BottomNav — visible uniquement < md via display:none ≥ md interne */}
      <BottomNav />

    </div>
  );
}