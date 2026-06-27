"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Loader, CheckCircle2, XCircle, ListTodo } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/process/status-badge";
import { useProcessesStore } from "@/stores/processes-store";
import { useAuthStore } from "@/stores/auth-store";
import { useTranslation } from "@/lib/i18n/use-translation";
import { stepById, isMyTask } from "@/lib/workflow-engine";
import type { ProcessStatus } from "@/types/process";

export default function DashboardPage() {
  const processes = useProcessesStore((s) => s.processes);
  const loadProcesses = useProcessesStore((s) => s.loadProcesses);
  const user = useAuthStore((s) => s.user);
  const { t } = useTranslation();

  useEffect(() => {
    loadProcesses();
  }, [loadProcesses]);

  const countBy = (status: ProcessStatus) =>
    processes.filter((p) => p.status === status).length;

  const myTaskCount = processes.filter((p) => {
    if (!user || p.status !== "in_progress" || !p.currentStepId) return false;
    const step = stepById(p.workflow, p.currentStepId);
    return step ? isMyTask(step, user) : false;
  }).length;

  const stats = [
    { label: t("dashboard.myTasks"), value: myTaskCount, icon: ListTodo },
    { label: t("status.in_progress"), value: countBy("in_progress"), icon: Loader },
    { label: t("status.completed"), value: countBy("completed"), icon: CheckCircle2 },
    { label: t("status.rejected"), value: countBy("rejected"), icon: XCircle },
  ];

  const recent = [...processes]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{t("dashboard.overview")}</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.recent")}</CardTitle>
          {recent.length === 0 && (
            <CardDescription>{t("dashboard.noProcesses")}</CardDescription>
          )}
        </CardHeader>
        {recent.length > 0 && (
          <CardContent className="space-y-2">
            {recent.map((process) => (
              <Link
                key={process.id}
                href={`/processes/${process.id}`}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {process.workflow.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {process.startedByName}
                  </p>
                </div>
                <StatusBadge status={process.status} />
              </Link>
            ))}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
