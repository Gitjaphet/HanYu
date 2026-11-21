// components/providers/ProgressHydrator.tsx — charge la progression enregistrée, côté navigateur uniquement
"use client";

import { useEffect } from "react";
import { useProgressStore } from "@/store/progressStore";

export function ProgressHydrator() {
  useEffect(() => {
    void useProgressStore.persist.rehydrate();
  }, []);

  return null;
}
