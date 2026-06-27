import {
  LayoutDashboard,
  FileText,
  Workflow,
  Waypoints,
  Users,
  ShieldCheck,
  Settings,
  type LucideIcon,
} from "lucide-react";

import type { Role } from "@/types/auth";
import type { TranslationKey } from "@/lib/i18n/dictionaries";

/**
 * Uygulamanın sol menü yapısı. `roles` verilmişse öğe yalnızca o rollerde görünür
 * (rol bazlı gösterim bonusu). Başlıklar çeviri anahtarıyla tutulur (i18n).
 */
export type NavItem = {
  titleKey: TranslationKey;
  href: string;
  icon: LucideIcon;
  roles?: Role[];
};

export const mainNav: NavItem[] = [
  { titleKey: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard },
  // Form tasarımı yönetimsel bir iştir; yalnızca admin görür.
  { titleKey: "nav.forms", href: "/forms", icon: FileText, roles: ["admin"] },
  { titleKey: "nav.workflows", href: "/workflows", icon: Waypoints, roles: ["admin"] },
  { titleKey: "nav.processes", href: "/processes", icon: Workflow },
  { titleKey: "nav.users", href: "/users", icon: Users, roles: ["admin"] },
  { titleKey: "nav.roles", href: "/roles", icon: ShieldCheck, roles: ["admin"] },
  { titleKey: "nav.settings", href: "/settings", icon: Settings },
];

/** Verilen role görünür menü öğelerini döndürür. */
export function navForRole(role: Role | undefined): NavItem[] {
  return mainNav.filter(
    (item) => !item.roles || (role !== undefined && item.roles.includes(role)),
  );
}

/** Aktif yola karşılık gelen sayfa başlığının çeviri anahtarı (yoksa null). */
export function getTitleKeyByPath(pathname: string): TranslationKey | null {
  const match = mainNav.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/"),
  );
  return match?.titleKey ?? null;
}
