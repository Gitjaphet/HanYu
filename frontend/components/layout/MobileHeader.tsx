"use client";

import Link from "next/link";
import { LogIn, Settings } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

/** En-tête mobile (sous 1024 px) : logo, thème, paramètres et compte. */
export function MobileHeader() {
  const account = useUserStore((st) => st.user);
  const accountStatus = useUserStore((st) => st.status);

  return (
    <header className="lg:hidden sticky top-0 z-30 bg-background/90 backdrop-blur-md px-4 py-3 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-hanzi text-lg font-bold">
          语
        </span>
        <span className="text-lg font-extrabold text-text">HanYu</span>
      </Link>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link
          href="/settings"
          aria-label="Paramètres"
          className="w-9 h-9 rounded-full bg-tint text-primary flex items-center justify-center"
        >
          <Settings size={18} aria-hidden="true" />
        </Link>
        {accountStatus !== "loading" &&
          (account ? (
            <Link
              href="/profile"
              aria-label={`Mon profil (${account.pseudo})`}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-xs font-extrabold text-text"
            >
              {account.pseudo.slice(0, 2).toUpperCase()}
            </Link>
          ) : (
            <Link
              href="/login"
              aria-label="Se connecter"
              className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center"
            >
              <LogIn size={17} aria-hidden="true" />
            </Link>
          ))}
      </div>
    </header>
  );
}
