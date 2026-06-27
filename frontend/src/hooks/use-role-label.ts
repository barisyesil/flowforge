"use client";

import { useTranslation } from "@/lib/i18n/use-translation";
import { useRolesStore } from "@/stores/roles-store";
import { roleLabel } from "@/lib/roles";

/** Rol id'sini görünür etikete çeviren fonksiyon döndürür (sistem rolü → i18n, özel rol → ad). */
export function useRoleLabel() {
  const { t } = useTranslation();
  const roles = useRolesStore((s) => s.roles);
  return (roleId: string) => roleLabel(roleId, roles, t);
}
