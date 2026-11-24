import {
  BookOpen, Dumbbell, Gamepad2, House, Settings, Trophy, User, type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Vrai si la page courante appartient à cette entrée du menu */
  match: (path: string) => boolean;
  /** Affiché aussi dans la barre du bas sur mobile */
  mobile: boolean;
};

/** Menu principal, partagé par la Sidebar (desktop) et la BottomNav (mobile). */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Accueil", icon: House, match: (p) => p === "/", mobile: true },
  { href: "/lecons", label: "Leçons", icon: BookOpen, match: (p) => p.startsWith("/lecons") || p.startsWith("/lesson"), mobile: true },
  { href: "/exercices", label: "Exercices", icon: Dumbbell, match: (p) => p.startsWith("/exercices"), mobile: false },
  { href: "/jeux", label: "Jeux", icon: Gamepad2, match: (p) => p.startsWith("/jeux"), mobile: true },
  { href: "/leaderboard", label: "Classement", icon: Trophy, match: (p) => p.startsWith("/leaderboard"), mobile: true },
  { href: "/profile", label: "Profil", icon: User, match: (p) => p.startsWith("/profile"), mobile: true },
  { href: "/settings", label: "Paramètres", icon: Settings, match: (p) => p.startsWith("/settings"), mobile: false },
];
