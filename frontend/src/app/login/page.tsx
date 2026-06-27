"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";
import { authenticate, demoCredentials } from "@/lib/mock-users";
import { roleLabels } from "@/types/auth";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Zaten giriş yapılmışsa uygulamaya yönlendir.
  useEffect(() => {
    if (hasHydrated && user) {
      router.replace("/dashboard");
    }
  }, [hasHydrated, user, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const authed = authenticate(username.trim(), password);
    if (!authed) {
      setError("Kullanıcı adı veya şifre hatalı.");
      return;
    }

    login(authed);
    toast.success(`Hoş geldiniz, ${authed.displayName}`);
    router.replace("/dashboard");
  }

  function fillDemo(u: string, p: string) {
    setUsername(u);
    setPassword(p);
    setError(null);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
            F
          </div>
          <div>
            <CardTitle className="text-xl">FlowForge</CardTitle>
            <CardDescription>
              Devam etmek için hesabınıza giriş yapın
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Kullanıcı Adı</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full">
              Giriş Yap
            </Button>
          </CardContent>
        </form>

        <CardFooter className="flex-col items-stretch gap-2 border-t pt-4">
          <p className="text-xs text-muted-foreground">
            Demo hesapları (tıklayarak doldurun):
          </p>
          <div className="flex flex-col gap-1.5">
            {demoCredentials.map((c) => (
              <button
                key={c.username}
                type="button"
                onClick={() => fillDemo(c.username, c.password)}
                className="flex items-center justify-between rounded-md border px-3 py-1.5 text-xs transition-colors hover:bg-muted"
              >
                <span className="font-mono">
                  {c.username} / {c.password}
                </span>
                <Badge variant="secondary" className="font-normal">
                  {roleLabels[c.role]}
                </Badge>
              </button>
            ))}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
