import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { User } from "@/types/auth";

type AuthState = {
  user: User | null;
  /** persist'in localStorage'dan yüklenmesi tamamlandı mı? (SSR uyumsuzluğunu önler) */
  hasHydrated: boolean;
  login: (user: User) => void;
  logout: () => void;
  /** Aktif kullanıcının bilgilerini kısmi olarak günceller (profil düzenleme). */
  updateUser: (patch: Partial<User>) => void;
  setHasHydrated: (value: boolean) => void;
};

/**
 * Global oturum durumu. Doküman gereği aktif kullanıcı ve rol bilgisi burada
 * tutulur ve uygulama boyunca paylaşılır. localStorage'a kalıcılaştırılır.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hasHydrated: false,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
      updateUser: (patch) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...patch } : state.user,
        })),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "flowforge-auth",
      // Yalnızca kullanıcıyı kalıcılaştır; geçici hydration bayrağını değil.
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
