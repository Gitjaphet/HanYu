"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  BookOpen, Trophy, User, Settings,
  ChevronRight, Zap, BarChart2,
  Dumbbell, Gamepad2, GraduationCap // Nouvelles icônes importées
} from "lucide-react";
import styles from "./Sidebar.module.css";
import { useCurriculum } from "@/hooks/useLessons";
import { useProgressStore } from "@/store/progressStore";

const mockUser = { initials: "IN", name: "Invité", xp: 15, xpGoal: 50, streak: 3 };

function SidebarContent() {
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const currentLevel = searchParams.get("level") ?? "A";
  const currentUnit  = Number(searchParams.get("unit") ?? "1");

  const { data: curriculum } = useCurriculum();
  const progress = useProgressStore((st) => st.progress);
  const hydrated = useProgressStore((st) => st.hydrated);

  // Leçons restantes = leçons du cursus dont le quiz n'est pas validé
  const lessonIds = curriculum.flatMap((lv) => lv.units.flatMap((u) => u.lessonIds));
  const remaining = lessonIds.filter((id) => !progress[id]?.quizDone).length;

  const [lessonsOpen,   setLessonsOpen]   = useState(true);
  const [expandedLevel, setExpandedLevel] = useState<string>(currentLevel);

  useEffect(() => { setExpandedLevel(currentLevel); }, [currentLevel]);

  const isActive    = (href: string) => pathname === href;
  const toggleLevel = (id: string)   => setExpandedLevel(p => p === id ? "" : id);

  return (
    <aside className={`hidden lg:flex flex-col w-64 h-screen bg-card fixed left-0 top-0 border-r border-border z-50 ${styles.sidebar}`}>

      {/* ══ LOGO ══ */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[#FF8A66] flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-white font-bold text-xl font-noto-serif-sc leading-none">语</span>
        </div>
        <div className="leading-tight">
          <div className="text-base font-extrabold text-text tracking-tight">HanYu</div>
          <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">Mandarin</div>
        </div>
      </div>

      {/* ══ USER CARD ══ */}
      <div className={`mx-3 mt-3 mb-1 p-4 ${styles.userCard}`}>
        <div className={styles.userCardBg}>汉</div>

        <div className="flex items-center gap-3 mb-3.5 relative z-10">
          <div className={styles.avatar}>{mockUser.initials}</div>
          <div className="flex-1 min-w-0">
            <div className="text-black font-bold text-sm leading-tight truncate">{mockUser.name}</div>
            <div className="text-black/60 text-[12px] mt-0.5 truncate">
              Niv. {currentLevel} · {curriculum.find(l => l.code === currentLevel)?.label}
            </div>
          </div>
          <div className="flex items-center gap-1 bg-black/10 text-black text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
            <Zap size={16} className="text-[orange]" />
            {mockUser.streak}
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex justify-between text-[10px] font-semibold text-black/50 mb-1.5 uppercase tracking-wider">
            <span>Progression</span>
            <span>{mockUser.xp} / {mockUser.xpGoal} XP</span>
          </div>
          <div className={styles.xpTrack}>
            <div className={styles.xpFill} style={{ width: `${Math.min((mockUser.xp / mockUser.xpGoal) * 100, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* ══ NAV ══ */}
      <nav className={`${styles.nav} flex-1 px-3 pt-4 overflow-y-auto pb-4`}>

        {/* — Apprentissage — */}
        <p className={styles.sectionLabel}>Apprentissage</p>

        {/* Leçons */}
        <button
          onClick={() => setLessonsOpen(!lessonsOpen)}
          className={`${styles.navItem} ${pathname === "/" ? styles.navItemActive : ""}`}
        >
          <div className="flex items-center gap-3">
            <div className={styles.iconBox}>
              <BookOpen size={16} strokeWidth={1.9} />
            </div>
            <span>Leçons</span>
          </div>
          <ChevronRight
            size={13}
            strokeWidth={2.5}
            className={`${styles.chevron} ${lessonsOpen ? styles.chevronOpen : ""}`}
          />
        </button>

        {/* Accordion niveaux */}
        <div className={`${styles.subnav} ${lessonsOpen ? styles.subnavOpen : ""}`}>
          <div className={styles.treeRoot}>
            {curriculum.map((lvl) => {
              const isActiveLevel = currentLevel === lvl.code && pathname === "/";
              const isExpanded    = expandedLevel === lvl.code;

              return (
                <div key={lvl.code} className={styles.treeGroup}>
                  <button
                    onClick={() => toggleLevel(lvl.code)}
                    className={`${styles.levelItem} ${isActiveLevel ? styles.levelItemActive : ""}`}
                  >
                    <span className={styles.levelLabel}>Niveau {lvl.code}</span>
                    {lvl.units.length > 0 && (
                      <ChevronRight
                        size={11}
                        strokeWidth={2.5}
                        className={`${styles.chevronSm} ${isExpanded ? styles.chevronSmOpen : ""}`}
                      />
                    )}
                  </button>

                  {lvl.units.length > 0 && (
                    <div className={`${styles.unitAccordion} ${isExpanded ? styles.unitAccordionOpen : ""}`}>
                      <div className={styles.unitList}>
                        {lvl.units.map((u) => {
                          const isUnitActive =
                            currentUnit === u.number &&
                            currentLevel === lvl.code &&
                            pathname === "/";
                          return (
                            <Link
                              key={u.number}
                              href={`/?level=${lvl.code}&unit=${u.number}`}
                              className={`${styles.unitItem} ${isUnitActive ? styles.unitItemActive : ""}`}
                            >
                              <span className={styles.unitDot} />
                              Unité {u.number}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Exercices */}
        <Link
          href="/exercices"
          className={`${styles.navItem} mt-1 ${isActive("/exercices") ? styles.navItemActive : ""}`}
        >
          <div className="flex items-center gap-3">
            <div className={styles.iconBox}>
              <Dumbbell size={16} strokeWidth={1.9} />
            </div>
            <span>Exercices</span>
          </div>
        </Link>

        {/* Jeux (Nouveau menu) */}
        <Link
          href="/jeux"
          className={`${styles.navItem} mt-1 ${isActive("/jeux") ? styles.navItemActive : ""}`}
        >
          <div className="flex items-center gap-3">
            <div className={styles.iconBox}>
              <Gamepad2 size={16} strokeWidth={1.9} />
            </div>
            <span>Jeux</span>
          </div>
        </Link>

        {/* — Évaluation — */}
        <p className={`${styles.sectionLabel} mt-5`}>Évaluation</p>

        <Link
          href="/examen"
          className={`${styles.navItem} ${isActive("/examen") ? styles.navItemActive : ""}`}
        >
          <div className="flex items-center gap-3">
            <div className={styles.iconBox}>
              <GraduationCap size={16} strokeWidth={1.9} />
            </div>
            <span>Examens</span>
          </div>
        </Link>

        {/* — Communauté — */}
        <p className={`${styles.sectionLabel} mt-5`}>Communauté</p>

        <Link
          href="/leaderboard"
          className={`${styles.navItem} ${isActive("/leaderboard") ? styles.navItemActive : ""}`}
        >
          <div className="flex items-center gap-3">
            <div className={styles.iconBox}>
              <Trophy size={16} strokeWidth={1.9} />
            </div>
            <span>Classement</span>
          </div>
          <span className={styles.badge}>TOP 10</span>
        </Link>

        {/* — Compte — */}
        <p className={`${styles.sectionLabel} mt-5`}>Compte</p>

        <Link
          href="/profile"
          className={`${styles.navItem} ${isActive("/profile") ? styles.navItemActive : ""}`}
        >
          <div className="flex items-center gap-3">
            <div className={styles.iconBox}>
              <User size={16} strokeWidth={1.9} />
            </div>
            <span>Profil</span>
          </div>
        </Link>

        <Link
          href="/settings"
          className={`${styles.navItem} mt-1 ${isActive("/settings") ? styles.navItemActive : ""}`}
        >
          <div className="flex items-center gap-3">
            <div className={styles.iconBox}>
              <Settings size={16} strokeWidth={1.9} />
            </div>
            <span>Paramètres</span>
          </div>
        </Link>

      </nav>

      {/* ══ FOOTER NETTOYÉ ══ */}
      <div className="hidden lg:block px-3 py-3 border-t border-border mt-auto">
        <div className="flex items-center gap-2.5 bg-background px-3 py-2.5 rounded-xl border border-border">
          <BarChart2 size={15} className="text-primary flex-shrink-0" />
          <span className="text-xs font-semibold text-text truncate">
            {!hydrated || lessonIds.length === 0
              ? "Chargement…"
              : remaining === 0
                ? "Toutes les leçons terminées 🎉"
                : `${remaining} leçon${remaining > 1 ? "s" : ""} à compléter`}
          </span>
        </div>
      </div>

    </aside>
  );
}

export const Sidebar = () => (
  <Suspense fallback={<div className="hidden md:block w-64 h-screen bg-card fixed left-0 top-0 border-r border-border z-50" />}>
    <SidebarContent />
  </Suspense>
);