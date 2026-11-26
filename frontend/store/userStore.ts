// store/userStore.ts — le compte connecté. La vraie session est le cookie HttpOnly :
// ce store n'en garde qu'une copie pour l'affichage, rechargée depuis /auth/me.
"use client";

import { create } from "zustand";
import type { User } from "@/types";
import * as auth from "@/lib/auth";
import { useProgressStore } from "@/store/progressStore";

type Status = "loading" | "authenticated" | "anonymous";

interface UserState {
  user: User | null;
  status: Status;
  load: () => Promise<void>;
  login: (data: auth.LoginData) => Promise<void>;
  register: (data: auth.RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

/** Un compte vient d'être reconnu : sa progression locale et celle du serveur sont réunies. */
function connected(user: User) {
  void useProgressStore.getState().syncWithAccount(user.id);
}

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  status: "loading",

  load: async () => {
    try {
      const user = await auth.getMe();
      set({ user, status: user ? "authenticated" : "anonymous" });
      if (user) connected(user);
    } catch {
      set({ user: null, status: "anonymous" }); // API injoignable : on continue en invité
    }
  },

  login: async (data) => {
    const user = await auth.login(data);
    set({ user, status: "authenticated" });
    connected(user);
  },

  register: async (data) => {
    const user = await auth.register(data);
    set({ user, status: "authenticated" });
    connected(user);
  },

  resetPassword: async (token, password) => {
    const user = await auth.resetPassword(token, password);
    set({ user, status: "authenticated" });
    connected(user);
  },

  logout: async () => {
    await auth.logout();
    set({ user: null, status: "anonymous" });
    useProgressStore.getState().leaveAccount();
  },
}));
