import {
  LayoutDashboard,
  FileText,
  Workflow,
  Settings,
  type LucideIcon,
} from "lucide-react";

import type { Role } from "@/types/auth";

/**
 * Uygulamanın sol menü yapısı. `roles` verilmişse öğe yalnızca o rollerde görünür
 * (rol bazlı gösterim bonusu). Verilmemişse tüm roller görür.
 */
export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  roles?: Role[];
};

export const mainNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  // Form tasarımı yönetimsel bir iştir; yalnızca admin görür.
  { title: "Form Tasarımı", href: "/forms", icon: FileText, roles: ["admin"] },
  { title: "Süreçler / İşlerim", href: "/processes", icon: Workflow },
  { title: "Ayarlar", href: "/settings", icon: Settings },
];

/** Verilen role görünür menü öğelerini döndürür. */
export function navForRole(role: Role | undefined): NavItem[] {
  return mainNav.filter(
    (item) => !item.roles || (role !== undefined && item.roles.includes(role)),
  );
}

/** Aktif yola karşılık gelen sayfa başlığını döndürür (header'da kullanılır). */
export function getTitleByPath(pathname: string): string {
  const match = mainNav.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/"),
  );
  return match?.title ?? "FlowForge";
}
