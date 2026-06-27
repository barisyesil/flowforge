"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAuthStore } from "@/stores/auth-store";
import { useRolesStore } from "@/stores/roles-store";

/**
 * Korunan alanları sarar: oturum yoksa /login'e yönlendirir.
 * persist localStorage'dan yüklenene (hasHydrated) kadar bir yükleniyor
 * göstergesi render eder; böylece sunucu/istemci uyumsuzluğu ve "flaş" önlenir.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const loadRoles = useRolesStore((s) => s.loadRoles);

  useEffect(() => {
    if (hasHydrated && !user) {
      router.replace("/login");
    }
  }, [hasHydrated, user, router]);

  // Rol etiketlerinin (özel roller dahil) çözülebilmesi için rolleri yükle.
  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  if (!hasHydrated || !user) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
