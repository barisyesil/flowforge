"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/process/status-badge";
import { useProcessesStore } from "@/stores/processes-store";
import { useAuthStore } from "@/stores/auth-store";
import { useTranslation } from "@/lib/i18n/use-translation";
import { stepById, isMyTask } from "@/lib/workflow-engine";
import type { ProcessInstance } from "@/types/process";

type Tab = "all" | "mine";

export default function ProcessesPage() {
  const processes = useProcessesStore((s) => s.processes);
  const status = useProcessesStore((s) => s.status);
  const loadProcesses = useProcessesStore((s) => s.loadProcesses);
  const user = useAuthStore((s) => s.user);
  const { t } = useTranslation();

  const [tab, setTab] = useState<Tab>("all");

  useEffect(() => {
    loadProcesses();
  }, [loadProcesses]);

  /** Sürecin aktif adımı bana mı atanmış? (İşlerim) */
  function isMine(p: ProcessInstance): boolean {
    if (!user || p.status !== "in_progress" || !p.currentStepId) return false;
    const step = stepById(p.workflow, p.currentStepId);
    return step ? isMyTask(step, user) : false;
  }

  function currentStepName(p: ProcessInstance): string | null {
    if (p.status !== "in_progress" || !p.currentStepId) return null;
    return stepById(p.workflow, p.currentStepId)?.name ?? null;
  }

  const sorted = [...processes].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  const visible = tab === "mine" ? sorted.filter(isMine) : sorted;
  const myCount = sorted.filter(isMine).length;

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: t("processes.all") },
    { key: "mine", label: `${t("processes.mine")}${myCount ? ` (${myCount})` : ""}` },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border bg-muted/40 p-0.5">
          {tabs.map((tabItem) => (
            <button
              key={tabItem.key}
              type="button"
              onClick={() => setTab(tabItem.key)}
              className={cn(
                "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                tab === tabItem.key
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tabItem.label}
            </button>
          ))}
        </div>

        <Button
          render={
            <Link href="/processes/new">
              <Plus className="h-4 w-4" />
              {t("processes.new")}
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
              {tab === "mine" ? t("processes.mineEmpty") : t("processes.empty")}
            </CardTitle>
            <CardDescription>
              {tab === "mine" ? t("task.subtitle") : t("processes.emptyHint")}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-2">
          {visible.map((process) => {
            const stepName = currentStepName(process);
            return (
              <Link
                key={process.id}
                href={`/processes/${process.id}`}
                className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {process.workflow.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {process.startedByName} ·{" "}
                    {new Date(process.createdAt).toLocaleString()}
                  </p>
                </div>
                {stepName && (
                  <Badge variant="outline" className="hidden font-normal sm:inline-flex">
                    {stepName}
                  </Badge>
                )}
                <StatusBadge status={process.status} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
