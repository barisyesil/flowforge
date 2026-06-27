"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarContent } from "@/components/layout/sidebar";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { getTitleKeyByPath } from "@/lib/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useRoleLabel } from "@/hooks/use-role-label";

/** Görünen isimden baş harfleri üretir (avatar fallback). */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Üst bar: mobilde menüyü açan tetikleyici, aktif sayfa başlığı ve
 * aktif kullanıcı menüsü (global oturum durumundan).
 */
export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const roleLabel = useRoleLabel();
  const [mobileOpen, setMobileOpen] = useState(false);
  const titleKey = getTitleKeyByPath(pathname);
  const title = titleKey ? t(titleKey) : "FlowForge";

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-3">
        {/* Mobil menü */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t("header.openMenu")}</span>
              </Button>
            }
          />
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">{t("header.navigation")}</SheetTitle>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <h1 className="text-base font-semibold md:text-lg">{title}</h1>
      </div>

      <div className="flex items-center gap-1">
        <LanguageSwitcher />
        <ThemeToggle />

        {/* Aktif kullanıcı */}
        <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs">
                  {user ? getInitials(user.displayName) : "?"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">
                {user?.displayName ?? "—"}
              </span>
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex flex-col gap-1">
            <span>{user?.displayName ?? "—"}</span>
            {user && (
              <Badge variant="secondary" className="w-fit text-xs font-normal">
                {roleLabel(user.role)}
              </Badge>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              {t("header.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
