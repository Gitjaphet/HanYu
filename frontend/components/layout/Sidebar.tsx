"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  BookOpen, ChevronDown, Dumbbell, Gamepad2, LogIn, LogOut,
  Settings, Trophy, User, type LucideIcon,
} from "lucide-react";
import { useCurriculum } from "@/hooks/useLessons";
import { useUserStore } from "@/store/userStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

// Largeur partagée avec le layout (marge du contenu principal)
export const SIDEBAR_WIDTH = "w-64";

const itemBase =
  "flex items-center gap-3.5 w-full px-3.5 py-3 rounded-xl text-[15px] transition-colors";
const itemIdle = "text-text-muted font-bold hover:bg-background hover:text-text";
const itemActive = "bg-tint text-text font-extrabold";

function NavLink({ href, icon: Icon, label, active }: {
  href: string; icon: LucideIcon; label: string; active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${itemBase} ${active ? itemActive : itemIdle}`}
    >
      <Icon size={20} strokeWidth={2} className={active ? "text-primary" : ""} />
      {label}
    </Link>
  );
}

function SidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentLevel = searchParams.get("level") ?? "A";
  const currentUnit = Number(searchParams.get("unit") ?? "1");
  const onLessons = pathname === "/";

  const { data: curriculum } = useCurriculum();
  const account = useUserStore((st) => st.user);
  const accountStatus = useUserStore((st) => st.status);
  const logout = useUserStore((st) => st.logout);

  const [lessonsOpen, setLessonsOpen] = useState(true);
  const [expandedLevel, setExpandedLevel] = useState(currentLevel);
  // Quand l'URL change de niveau, on déplie ce niveau (ajustement pendant le rendu,
  // recommandé par React plutôt qu'un useEffect)
  const [seenLevel, setSeenLevel] = useState(currentLevel);
  if (seenLevel !== currentLevel) {
    setSeenLevel(currentLevel);
    setExpandedLevel(currentLevel);
  }

  return (
    <aside
      aria-label="Menu principal"
      className={`hidden lg:flex flex-col ${SIDEBAR_WIDTH} h-screen fixed left-0 top-0 z-40 bg-card border-r border-border px-4 py-6`}
    >
      {/* ── Logo + thème ── */}
      <div className="flex items-center justify-between px-2 mb-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-hanzi text-xl font-bold">
            语
          </span>
          <span className="text-xl font-extrabold text-text">HanYu</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* ── Menu ── */}
      <nav className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => setLessonsOpen((o) => !o)}
          aria-expanded={lessonsOpen}
          className={`${itemBase} ${onLessons ? itemActive : itemIdle}`}
        >
          <BookOpen size={20} strokeWidth={2} className={onLessons ? "text-primary" : ""} />
          <span className="flex-1 text-left">Leçons</span>
          <ChevronDown size={16} className={`transition-transform ${lessonsOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Arbre Niveaux → Unités */}
        {lessonsOpen && (
          <div className="ml-6 pl-3 border-l-2 border-border flex flex-col gap-0.5 mb-2">
            {curriculum.map((lvl) => {
              const expanded = expandedLevel === lvl.code;
              return (
                <div key={lvl.code}>
                  <button
                    type="button"
                    onClick={() => setExpandedLevel(expanded ? "" : lvl.code)}
                    aria-expanded={expanded}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm font-bold text-text text-left hover:bg-background"
                  >
                    <span className="flex-1 min-w-0 truncate">
                      Niveau {lvl.code}
                      <span className="ml-1.5 font-semibold text-text-muted">{lvl.label}</span>
                    </span>
                    {lvl.units.length > 0 && (
                      <ChevronDown size={14} className={`text-text-muted transition-transform ${expanded ? "rotate-180" : ""}`} />
                    )}
                  </button>

                  {expanded && lvl.units.map((u) => {
                    const active = onLessons && currentLevel === lvl.code && currentUnit === u.number;
                    return (
                      <Link
                        key={u.number}
                        href={`/?level=${lvl.code}&unit=${u.number}`}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-2 pl-5 pr-2.5 py-1.5 rounded-lg text-sm ${
                          active ? "text-primary font-extrabold" : "text-text-muted font-semibold hover:text-text"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? "bg-primary" : "bg-border"}`} />
                        <span className="truncate" title={u.title}>Unité {u.number} · {u.title}</span>
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        <NavLink href="/exercices" icon={Dumbbell} label="Exercices" active={pathname === "/exercices"} />
        <NavLink href="/jeux" icon={Gamepad2} label="Jeux" active={pathname.startsWith("/jeux")} />
        <NavLink href="/leaderboard" icon={Trophy} label="Classement" active={pathname === "/leaderboard"} />
        <NavLink href="/profile" icon={User} label="Profil" active={pathname === "/profile"} />
        <NavLink href="/settings" icon={Settings} label="Paramètres" active={pathname === "/settings"} />
      </nav>

      {/* ── Compte ── */}
      {accountStatus !== "loading" && (
        <div className="mt-4 rounded-2xl bg-background p-3 flex items-center gap-3">
          {account ? (
            <>
              <span className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-sm font-extrabold text-text shrink-0">
                {account.pseudo.slice(0, 2).toUpperCase()}
              </span>
              <span className="flex-1 min-w-0 text-sm font-extrabold text-text truncate">{account.pseudo}</span>
              <button
                type="button"
                onClick={() => void logout()}
                aria-label="Se déconnecter"
                title="Se déconnecter"
                className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:bg-card hover:text-text"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary text-white text-sm font-extrabold py-2.5 hover:bg-primary-dark"
            >
              <LogIn size={17} />
              Se connecter
            </Link>
          )}
        </div>
      )}
    </aside>
  );
}

export function Sidebar() {
  return (
    <Suspense fallback={<div className={`hidden lg:block ${SIDEBAR_WIDTH} h-screen fixed left-0 top-0 bg-card border-r border-border`} />}>
      <SidebarContent />
    </Suspense>
  );
}
