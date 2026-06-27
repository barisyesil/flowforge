"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Sun, Moon, Monitor, LogOut, Loader2 } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useUsersStore } from "@/stores/users-store";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { Language } from "@/lib/i18n/dictionaries";

const THEME_OPTIONS = [
  { value: "light", labelKey: "theme.light", icon: Sun },
  { value: "dark", labelKey: "theme.dark", icon: Moon },
  { value: "system", labelKey: "theme.system", icon: Monitor },
] as const;

const LANGUAGE_OPTIONS: { value: Language; labelKey: "lang.tr" | "lang.en" }[] = [
  { value: "tr", labelKey: "lang.tr" },
  { value: "en", labelKey: "lang.en" },
];

export default function SettingsPage() {
  const router = useRouter();
  const { t, language, setLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();

  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useAuthStore((s) => s.logout);
  const editUser = useUsersStore((s) => s.editUser);

  const [mounted, setMounted] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => setMounted(true), []);

  async function handleSaveProfile() {
    if (!user || !displayName.trim()) return;
    setSaving(true);
    const result = await editUser(user.id, { displayName: displayName.trim() });
    setSaving(false);
    if (result === "ok") {
      updateUser({ displayName: displayName.trim() });
      toast.success(t("settings.profileSaved"));
    }
  }

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="max-w-2xl space-y-4">
      {/* Profil */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.profile")}</CardTitle>
          <CardDescription>{t("settings.profileHint")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="display-name">{t("settings.fullName")}</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span className="text-muted-foreground">
              {t("settings.username")}:{" "}
              <span className="font-mono text-foreground">
                {user?.username ?? "—"}
              </span>
            </span>
            <span className="flex items-center gap-2 text-muted-foreground">
              {t("settings.role")}:
              {user && <Badge variant="secondary">{t(`role.${user.role}`)}</Badge>}
            </span>
          </div>
          <Button onClick={handleSaveProfile} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("settings.saveProfile")}
          </Button>
        </CardContent>
      </Card>

      {/* Tercihler */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.preferences")}</CardTitle>
          <CardDescription>{t("settings.preferencesHint")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("settings.theme")}</Label>
            <div className="inline-flex rounded-lg border bg-muted/40 p-0.5">
              {THEME_OPTIONS.map((option) => {
                const isActive = mounted && theme === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-background shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <option.icon className="h-4 w-4" />
                    {t(option.labelKey)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("settings.language")}</Label>
            <div className="inline-flex rounded-lg border bg-muted/40 p-0.5">
              {LANGUAGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setLanguage(option.value)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    language === option.value
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t(option.labelKey)}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Oturum */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.account")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            {t("settings.logout")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
