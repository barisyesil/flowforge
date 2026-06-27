import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Language } from "@/lib/i18n/dictionaries";

type I18nState = {
  language: Language;
  hasHydrated: boolean;
  setLanguage: (language: Language) => void;
  setHasHydrated: (value: boolean) => void;
};

/** Aktif dil; localStorage'a kalıcılaştırılır. */
export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      language: "tr",
      hasHydrated: false,
      setLanguage: (language) => set({ language }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "flowforge-lang",
      partialize: (state) => ({ language: state.language }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
