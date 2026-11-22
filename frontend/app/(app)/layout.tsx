import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { ProgressHydrator } from "@/components/providers/ProgressHydrator";

/**
 * Coquille de l'application :
 *  - ≥ 1024 px : menu fixe à gauche (w-64) + contenu
 *  - < 1024 px : contenu + barre de navigation en bas
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <ProgressHydrator />
      <Sidebar />

      <main className="lg:pl-64 pb-28 lg:pb-10">
        <div className="max-w-5xl mx-auto w-full px-3 pt-5 md:px-6 md:pt-8">
          {children}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
