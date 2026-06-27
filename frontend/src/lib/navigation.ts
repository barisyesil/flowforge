import {
  LayoutDashboard,
  FileText,
  Workflow,
  Settings,
  type LucideIcon,
} from "lucide-react";

/**
 * Uygulamanın sol menü yapısı. Rol bazlı gösterim (bonus) için her öğeye
 * ileride `roles` alanı eklenecek; şimdilik tüm roller için görünür.
 */
export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const mainNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Form Tasarımı", href: "/forms", icon: FileText },
  { title: "Süreçler / İşlerim", href: "/processes", icon: Workflow },
  { title: "Ayarlar", href: "/settings", icon: Settings },
];

/** Aktif yola karşılık gelen sayfa başlığını döndürür (header'da kullanılır). */
export function getTitleByPath(pathname: string): string {
  const match = mainNav.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/"),
  );
  return match?.title ?? "FlowForge";
}
