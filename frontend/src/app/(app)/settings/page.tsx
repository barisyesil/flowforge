"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { roleLabels } from "@/types/auth";

const THEME_OPTIONS = [
  { value: "light", label: "Açık", icon: Sun },
  { value: "dark", label: "Koyu", icon: Moon },
  { value: "system", label: "Sistem", icon: Monitor },
];

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes değeri yalnızca istemcide bilinir; hydration uyumsuzluğunu önle.
  useEffect(() => setMounted(true), []);

  return (
    <div className="max-w-2xl space-y-4">
      {/* Kullanıcı bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Bilgileri</CardTitle>
          <CardDescription>Hesabınıza ait bilgiler.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between border-b pb-2">
            <span className="text-sm text-muted-foreground">Ad Soyad</span>
            <span className="text-sm font-medium">{user?.displayName ?? "—"}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-sm text-muted-foreground">Kullanıcı Adı</span>
            <span className="font-mono text-sm">{user?.username ?? "—"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Rol</span>
            {user && <Badge variant="secondary">{roleLabels[user.role]}</Badge>}
          </div>
        </CardContent>
      </Card>

      {/* Tercihler */}
      <Card>
        <CardHeader>
          <CardTitle>Tercihler</CardTitle>
          <CardDescription>Görünüm ayarları.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tema</Label>
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
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
