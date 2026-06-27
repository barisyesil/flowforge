"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Waypoints, ChevronRight, Loader2, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkflowsStore } from "@/stores/workflows-store";
import { useProcessesStore } from "@/stores/processes-store";
import { useUsersStore } from "@/stores/users-store";
import { useAuthStore } from "@/stores/auth-store";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useRoleLabel } from "@/hooks/use-role-label";
import type { WorkflowStep } from "@/types/workflow";

export default function NewProcessPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const roleLabel = useRoleLabel();

  const workflows = useWorkflowsStore((s) => s.workflows);
  const status = useWorkflowsStore((s) => s.status);
  const loadWorkflows = useWorkflowsStore((s) => s.loadWorkflows);
  const users = useUsersStore((s) => s.users);
  const loadUsers = useUsersStore((s) => s.loadUsers);
  const startProcess = useProcessesStore((s) => s.startProcess);
  const user = useAuthStore((s) => s.user);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadWorkflows();
    loadUsers();
  }, [loadWorkflows, loadUsers]);

  const selected = workflows.find((w) => w.id === selectedId);

  function assigneeLabel(step: WorkflowStep): string {
    if (step.assigneeUserId) {
      return (
        users.find((u) => u.id === step.assigneeUserId)?.displayName ??
        t("detail.unassigned")
      );
    }
    if (step.assigneeRole) return roleLabel(step.assigneeRole);
    return t("detail.unassigned");
  }

  async function handleStart() {
    if (!user || !selected) return;
    setSubmitting(true);
    const created = await startProcess(selected, user.displayName);
    setSubmitting(false);
    if (created) {
      toast.success(t("start.started"));
      router.push(`/processes/${created.id}`);
    } else {
      toast.error(t("wf.saveFailed"));
    }
  }

  if (status === "loading" && workflows.length === 0) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (workflows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("start.noWorkflows")}</CardTitle>
          <CardDescription>{t("start.noWorkflowsHint")}</CardDescription>
        </CardHeader>
        <div className="px-6 pb-6">
          <Button render={<Link href="/workflows">{t("start.goToDesign")}</Link>} />
        </div>
      </Card>
    );
  }

  // Seçildi → onay + adım önizlemesi + Başlat
  if (selected) {
    return (
      <div className="max-w-2xl space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSelectedId(null)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-sm font-semibold">{selected.name}</h2>
            <p className="text-xs text-muted-foreground">
              {t("wf.steps", { count: selected.steps.length })}
            </p>
          </div>
        </div>

        <Card>
          <div className="space-y-4 p-5">
            <div>
              <h3 className="mb-2 text-sm font-medium">
                {t("start.stepsTitle")}
              </h3>
              <ol className="space-y-2">
                {selected.steps.map((step, index) => (
                  <li key={step.id} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{step.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("detail.assignee")}: {assigneeLabel(step)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <p className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {t("start.startHint")}
            </p>

            <Button onClick={handleStart} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("start.startButton")}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Workflow seçici
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t("start.pickWorkflow")}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {workflows.map((workflow) => (
          <button
            key={workflow.id}
            type="button"
            onClick={() => setSelectedId(workflow.id)}
            className="flex items-center gap-3 rounded-xl border bg-card p-4 text-left transition-colors hover:bg-muted/50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Waypoints className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{workflow.name}</p>
              <p className="text-xs text-muted-foreground">
                {t("wf.steps", { count: workflow.steps.length })}
              </p>
            </div>
            <Badge variant="secondary" className="font-normal">
              v{workflow.version}
            </Badge>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}
