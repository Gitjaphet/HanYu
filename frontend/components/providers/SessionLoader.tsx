// components/providers/SessionLoader.tsx — au chargement du site : « qui est connecté ? »
"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/userStore";

export function SessionLoader() {
  useEffect(() => {
    void useUserStore.getState().load();
  }, []);

  return null;
}
