"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/process/status-badge";
import { useProcessesStore } from "@/stores/processes-store";
import { useAuthStore } from "@/stores/auth-store";
import { availableActions, canRoleAct } from "@/lib/process-machine";
import type { ProcessInstance } from "@/types/process";

type Tab = "all" | "mine";

export default function ProcessesPage() {
  const processes = useProcessesStore((s) => s.processes);
  const status = useProcessesStore((s) => s.status);
  const loadProcesses = useProcessesStore((s) => s.loadProcesses);
  const user = useAuthStore((s) => s.user);

  const [tab, setTab] = useState<Tab>("all");

  useEffect(() => {
    loadProcesses();
  }, [loadProcesses]);

  /** "İşlerim": rolümün işlem yapabileceği, beklemedeki/devam eden süreçler. */
  function needsMyAction(p: ProcessInstance): boolean {
    if (!user) return false;
    return availableActions(p.status).some((a) => canRoleAct(user.role, a));
  }

  const sorted = [...processes].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  const visible = tab === "mine" ? sorted.filter(needsMyAction) : sorted;
  const myCount = sorted.filter(needsMyAction).length;

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "Tüm Süreçler" },
    { key: "mine", label: `İşlerim${myCount ? ` (${myCount})` : ""}` },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border bg-muted/40 p-0.5">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                tab === t.key
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <Button
          render={
            <Link href="/processes/new">
              <Plus className="h-4 w-4" />
              Yeni Süreç Başlat
            </Link>
          }
        />
      </div>

      {status === "loading" && processes.length === 0 ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : visible.length === 0 ? (
        <Card>
          <CardHeader className="items-center text-center">
            <Inbox className="mb-1 h-6 w-6 text-muted-foreground" />
            <CardTitle className="text-base">
              {tab === "mine" ? "Bekleyen işiniz yok" : "Henüz süreç yok"}
            </CardTitle>
            <CardDescription>
              {tab === "mine"
                ? "Size atanmış, işlem bekleyen süreç bulunmuyor."
                : "“Yeni Süreç Başlat” ile bir form üzerinden süreç başlatın."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-2">
          {visible.map((process) => (
            <Link
              key={process.id}
              href={`/processes/${process.id}`}
              className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{process.formName}</p>
                <p className="text-xs text-muted-foreground">
                  {process.startedByName} ·{" "}
                  {new Date(process.createdAt).toLocaleString("tr-TR")}
                </p>
              </div>
              <StatusBadge status={process.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
