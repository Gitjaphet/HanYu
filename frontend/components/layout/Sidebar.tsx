"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, LogOut } from "lucide-react";
import { motion } from "motion/react";
import { useUserStore } from "@/store/userStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { NAV_ITEMS } from "./navItems";

/** Menu de gauche, affiché à partir de 1024 px (sous 1024 px : BottomNav). */
export function Sidebar() {
  const pathname = usePathname();
  const account = useUserStore((st) => st.user);
  const accountStatus = useUserStore((st) => st.status);
  const logout = useUserStore((st) => st.logout);

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 z-40 bg-card border-r border-border px-4 py-6">
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
      <nav aria-label="Menu principal" className="flex-1 flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`relative flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-[15px] transition-colors duration-200 ${
                active ? "text-text font-extrabold" : "text-text-muted font-bold hover:bg-background hover:text-text"
              }`}
            >
              {active && (
                <motion.span layoutId="sidebar-active" aria-hidden="true" className="absolute inset-0 rounded-xl bg-tint" />
              )}
              <Icon size={20} strokeWidth={2} aria-hidden="true" className={`relative ${active ? "text-primary" : ""}`} />
              <span className="relative">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Compte ── */}
      {accountStatus !== "loading" && (
        <div className="rounded-2xl bg-background p-3 flex items-center gap-3">
          {account ? (
            <>
              <span className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-sm font-extrabold text-text">
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
                <LogOut size={18} aria-hidden="true" />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-extrabold py-2.5"
            >
              <LogIn size={17} aria-hidden="true" />
              Se connecter
            </Link>
          )}
        </div>
      )}
    </aside>
  );
}
