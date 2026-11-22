// store/userStore.ts — le compte connecté. La vraie session est le cookie HttpOnly :
// ce store n'en garde qu'une copie pour l'affichage, rechargée depuis /auth/me.
"use client";

import { create } from "zustand";
import type { User } from "@/types";
import * as auth from "@/lib/auth";

type Status = "loading" | "authenticated" | "anonymous";

interface UserState {
  user: User | null;
  status: Status;
  load: () => Promise<void>;
  login: (data: auth.LoginData) => Promise<void>;
  register: (data: auth.RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  status: "loading",

  load: async () => {
    try {
      const user = await auth.getMe();
      set({ user, status: user ? "authenticated" : "anonymous" });
    } catch {
      set({ user: null, status: "anonymous" }); // API injoignable : on continue en invité
    }
  },

  login: async (data) => {
    const user = await auth.login(data);
    set({ user, status: "authenticated" });
  },

  register: async (data) => {
    const user = await auth.register(data);
    set({ user, status: "authenticated" });
  },

  logout: async () => {
    await auth.logout();
    set({ user: null, status: "anonymous" });
  },
}));
