"use client";

import { ShieldAlert } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { Role } from "@/types/auth";

/**
 * İçeriği yalnızca izin verilen rollere gösterir. Menüden gizlemenin yanında
 * doğrudan URL erişimini de engeller (rol bazlı yetkilendirme).
 */
export function RoleGuard({
  allow,
  children,
}: {
  allow: Role[];
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const { t } = useTranslation();

  if (!hasHydrated) return null;

  if (!user || !allow.includes(user.role)) {
    return (
      <Card>
        <CardHeader className="items-center text-center">
          <ShieldAlert className="mb-1 h-6 w-6 text-muted-foreground" />
          <CardTitle className="text-base">{t("access.denied")}</CardTitle>
          <CardDescription>{t("access.deniedHint")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <>{children}</>;
}
