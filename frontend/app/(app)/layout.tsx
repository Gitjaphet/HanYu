import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { ProgressHydrator } from "@/components/providers/ProgressHydrator";

/**
 * Coquille de l'application :
 *  - ≥ 1024 px : menu fixe à gauche (w-64) + contenu
 *  - < 1024 px : en-tête en haut + contenu + barre de navigation en bas
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <ProgressHydrator />
      <Sidebar />

      <div className="lg:pl-64">
        <MobileHeader />
        <main className="max-w-5xl xl:max-w-6xl mx-auto w-full px-3 pt-2 pb-28 md:px-6 lg:pt-8 lg:pb-10">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
