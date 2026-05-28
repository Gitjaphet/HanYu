"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { 
  BookOpen, Trophy, User, ChevronRight, X,
  Dumbbell, Gamepad2, GraduationCap, Settings // Ajout de Settings
} from "lucide-react";
import styles from "./BottomNav.module.css";

const curriculum = [
  {
    levelId: "A",
    label: "Initiation",
    units: [
      { id: 1, title: "Les bases" },
      { id: 2, title: "Se présenter" },
    ],
  },
  {
    levelId: "B",
    label: "Intermédiaire",
    units: [{ id: 1, title: "Au restaurant" }],
  },
  { levelId: "C", label: "Avancé", units: [] },
];

function BottomNavContent() {
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const currentLevel = searchParams.get("level") ?? "A";
  const currentUnit  = Number(searchParams.get("unit") ?? "1");

  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const [expandedLevel, setExpandedLevel] = useState<string>(currentLevel);

  const isLessonsActive = pathname === "/";

  const toggleLevel = (id: string) =>
    setExpandedLevel((p) => (p === id ? "" : id));

  const handleUnitClick = () => setDrawerOpen(false);

  return (
    <>
      {/* ── BACKDROP ── */}
      {drawerOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── DRAWER curriculum ── */}
      <div className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ""}`}>
        <div className={styles.drawerHeader}>
          <div className={styles.drawerHandle} />
          <span className={styles.drawerTitle}>Leçons</span>
          <button
            className={styles.drawerClose}
            onClick={() => setDrawerOpen(false)}
            aria-label="Fermer"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div className={styles.drawerBody}>
          {curriculum.map((lvl) => {
            const isExpanded    = expandedLevel === lvl.levelId;
            const isActiveLevel = currentLevel === lvl.levelId;

            return (
              <div key={lvl.levelId} className={styles.drawerGroup}>
                <button
                  className={`${styles.drawerLevel} ${isActiveLevel ? styles.drawerLevelActive : ""}`}
                  onClick={() => toggleLevel(lvl.levelId)}
                >
                  <div className={styles.drawerLevelLeft}>
                    <span className={styles.drawerLevelBadge}>{lvl.levelId}</span>
                    <div>
                      <span className={styles.drawerLevelName}>Niveau {lvl.levelId}</span>
                      <span className={styles.drawerLevelSub}>{lvl.label}</span>
                    </div>
                  </div>
                  {lvl.units.length > 0 && (
                    <ChevronRight
                      size={14}
                      strokeWidth={2.5}
                      className={`${styles.drawerChevron} ${isExpanded ? styles.drawerChevronOpen : ""}`}
                    />
                  )}
                </button>

                {lvl.units.length > 0 && (
                  <div className={`${styles.drawerUnits} ${isExpanded ? styles.drawerUnitsOpen : ""}`}>
                    {lvl.units.map((u) => {
                      const isUnitActive =
                        currentUnit === u.id &&
                        currentLevel === lvl.levelId &&
                        pathname === "/";

                      return (
                        <Link
                          key={u.id}
                          href={`/?level=${lvl.levelId}&unit=${u.id}`}
                          className={`${styles.drawerUnit} ${isUnitActive ? styles.drawerUnitActive : ""}`}
                          onClick={handleUnitClick}
                        >
                          <span className={styles.drawerUnitDot} />
                          <span>Unité {u.id}</span>
                          <span className={styles.drawerUnitTitle}>{u.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── WRAPPER BOTTOM NAV AVEC INDICATEUR DE SCROLL ── */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-card border-t border-border z-40">
        
        {/* Navigation scrollable horizontalement */}
        <nav 
          className={`${styles.nav} flex flex-nowrap justify-start overflow-x-auto snap-x snap-mandatory overscroll-x-contain px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`} 
          aria-label="Navigation mobile"
        >

          {/* Leçons */}
          <button
            className={`${styles.item} shrink-0 w-[4.5rem] snap-center ${isLessonsActive ? styles.itemActive : ""}`}
            onClick={() => setDrawerOpen(true)}
            aria-label="Ouvrir les leçons"
          >
            {isLessonsActive && <span className={styles.activePill} aria-hidden="true" />}
            <div className={`${styles.iconWrap} ${isLessonsActive ? styles.iconWrapActive : ""}`}>
              <BookOpen size={20} strokeWidth={isLessonsActive ? 2.2 : 1.7} />
            </div>
            <span className={`${styles.label} ${isLessonsActive ? styles.labelActive : ""}`}>
              Leçons
            </span>
          </button>

          {/* Exercices */}
          <Link
            href="/exercices"
            className={`${styles.item} shrink-0 w-[4.5rem] snap-center ${pathname === "/exercices" ? styles.itemActive : ""}`}
          >
            {pathname === "/exercices" && <span className={styles.activePill} aria-hidden="true" />}
            <div className={`${styles.iconWrap} ${pathname === "/exercices" ? styles.iconWrapActive : ""}`}>
              <Dumbbell size={20} strokeWidth={pathname === "/exercices" ? 2.2 : 1.7} />
            </div>
            <span className={`${styles.label} ${pathname === "/exercices" ? styles.labelActive : ""}`}>
              Pratique
            </span>
          </Link>

          {/* Jeux */}
          <Link
            href="/jeux"
            className={`${styles.item} shrink-0 w-[4.5rem] snap-center ${pathname === "/jeux" ? styles.itemActive : ""}`}
          >
            {pathname === "/jeux" && <span className={styles.activePill} aria-hidden="true" />}
            <div className={`${styles.iconWrap} ${pathname === "/jeux" ? styles.iconWrapActive : ""}`}>
              <Gamepad2 size={20} strokeWidth={pathname === "/jeux" ? 2.2 : 1.7} />
            </div>
            <span className={`${styles.label} ${pathname === "/jeux" ? styles.labelActive : ""}`}>
              Jeux
            </span>
          </Link>

          {/* Examens */}
          <Link
            href="/examen"
            className={`${styles.item} shrink-0 w-[4.5rem] snap-center ${pathname === "/examen" ? styles.itemActive : ""}`}
          >
            {pathname === "/examen" && <span className={styles.activePill} aria-hidden="true" />}
            <div className={`${styles.iconWrap} ${pathname === "/examen" ? styles.iconWrapActive : ""}`}>
              <GraduationCap size={20} strokeWidth={pathname === "/examen" ? 2.2 : 1.7} />
            </div>
            <span className={`${styles.label} ${pathname === "/examen" ? styles.labelActive : ""}`}>
              Examens
            </span>
          </Link>

          {/* Top */}
          <Link
            href="/leaderboard"
            className={`${styles.item} shrink-0 w-[4.5rem] snap-center ${pathname === "/leaderboard" ? styles.itemActive : ""}`}
          >
            {pathname === "/leaderboard" && <span className={styles.activePill} aria-hidden="true" />}
            <div className={`${styles.iconWrap} ${pathname === "/leaderboard" ? styles.iconWrapActive : ""}`}>
              <Trophy size={20} strokeWidth={pathname === "/leaderboard" ? 2.2 : 1.7} />
            </div>
            <span className={`${styles.label} ${pathname === "/leaderboard" ? styles.labelActive : ""}`}>
              Top
            </span>
          </Link>

          {/* Profil */}
          <Link
            href="/profile"
            className={`${styles.item} shrink-0 w-[4.5rem] snap-center ${pathname === "/profile" ? styles.itemActive : ""}`}
          >
            {pathname === "/profile" && <span className={styles.activePill} aria-hidden="true" />}
            <div className={`${styles.iconWrap} ${pathname === "/profile" ? styles.iconWrapActive : ""}`}>
              <User size={20} strokeWidth={pathname === "/profile" ? 2.2 : 1.7} />
            </div>
            <span className={`${styles.label} ${pathname === "/profile" ? styles.labelActive : ""}`}>
              Profil
            </span>
          </Link>

          {/* Paramètres */}
          <Link
            href="/settings"
            className={`${styles.item} shrink-0 w-[4.5rem] snap-center ${pathname === "/settings" ? styles.itemActive : ""}`}
          >
            {pathname === "/settings" && <span className={styles.activePill} aria-hidden="true" />}
            <div className={`${styles.iconWrap} ${pathname === "/settings" ? styles.iconWrapActive : ""}`}>
              <Settings size={20} strokeWidth={pathname === "/settings" ? 2.2 : 1.7} />
            </div>
            <span className={`${styles.label} ${pathname === "/settings" ? styles.labelActive : ""}`}>
              Paramètres
            </span>
          </Link>

        </nav>

        {/* ── INDICATEUR VISUEL (Ombre + Flèche) ── */}
        <div className="absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-card to-transparent pointer-events-none flex items-center justify-end pr-1">
          <ChevronRight size={18} className="text-text-muted opacity-60 animate-pulse" />
        </div>
        {/* Légère ombre à gauche quand on a scrollé vers la droite */}
        <div className="absolute top-0 left-0 bottom-0 w-4 bg-gradient-to-r from-card to-transparent pointer-events-none" />
      </div>
    </>
  );
}

export function BottomNav() {
  return (
    <Suspense
      fallback={
        <nav className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-card border-t border-border z-50" />
      }
    >
      <BottomNavContent />
    </Suspense>
  );
}