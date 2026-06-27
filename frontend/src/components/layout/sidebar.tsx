"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { navForRole } from "@/lib/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useTranslation } from "@/lib/i18n/use-translation";

/**
 * Marka logosu + ana navigasyon. Hem masaüstü (sabit aside) hem mobil
 * (Sheet içinde) kullanılmak üzere tek bir paylaşılan bileşen.
 */
export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.user?.role);
  const navItems = navForRole(role);
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Marka */}
      <div className="flex h-16 items-center gap-2.5 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
          F
        </div>
        <span className="text-lg font-semibold tracking-tight">FlowForge</span>
      </div>

      {/* Navigasyon */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {t(item.titleKey)}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4 text-xs text-muted-foreground">
        {t("nav.tagline")}
      </div>
    </div>
  );
}
