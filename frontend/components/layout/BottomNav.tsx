"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./navItems";

/** Barre de navigation du bas, affichée sous 1024 px. */
export function BottomNav() {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => item.mobile);

  return (
    <nav
      aria-label="Menu principal"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border rounded-t-3xl px-2 pt-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] grid grid-cols-5"
    >
      {items.map(({ href, label, icon: Icon, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-1 py-1 text-[11px] ${
              active ? "text-primary font-extrabold" : "text-text-muted font-bold"
            }`}
          >
            <span className={`w-11 h-8 rounded-xl flex items-center justify-center ${active ? "bg-tint" : ""}`}>
              <Icon size={20} strokeWidth={2} aria-hidden="true" />
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
