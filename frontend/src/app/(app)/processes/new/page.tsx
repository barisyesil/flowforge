"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Waypoints, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StepAction } from "@/components/process/step-action";
import { useWorkflowsStore } from "@/stores/workflows-store";
import { useFormsStore } from "@/stores/forms-store";
import { useProcessesStore } from "@/stores/processes-store";
import { useAuthStore } from "@/stores/auth-store";
import { useTranslation } from "@/lib/i18n/use-translation";
import { stepById, actionLabels } from "@/lib/workflow-engine";
import type { FormSubmission } from "@/types/form";

export default function NewProcessPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const workflows = useWorkflowsStore((s) => s.workflows);
  const status = useWorkflowsStore((s) => s.status);
  const loadWorkflows = useWorkflowsStore((s) => s.loadWorkflows);
  const forms = useFormsStore((s) => s.forms);
  const loadForms = useFormsStore((s) => s.loadForms);
  const startProcess = useProcessesStore((s) => s.startProcess);
  const applyAction = useProcessesStore((s) => s.applyAction);
  const user = useAuthStore((s) => s.user);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadWorkflows();
    loadForms();
  }, [loadWorkflows, loadForms]);

  const selected = workflows.find((w) => w.id === selectedId);

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

  if (selected) {
    const workflow = selected;
    const startStep = stepById(workflow, workflow.startStepId);
    const form =
      startStep?.formId !== undefined
        ? forms.find((f) => f.id === startStep.formId)
        : undefined;
    const actions = startStep ? actionLabels(startStep) : [];

    async function handleAct(action: string, data: FormSubmission) {
      if (!user) return;
      setSubmitting(true);
      const created = await startProcess(workflow, user.displayName);
      if (!created) {
        setSubmitting(false);
        toast.error(t("wf.saveFailed"));
        return;
      }
      const updated = await applyAction(
        created.id,
        action,
        data,
        user.displayName,
      );
      setSubmitting(false);
      if (updated) {
        toast.success(t("start.started"));
        router.push(`/processes/${created.id}`);
      }
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSelectedId(null)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-sm font-semibold">{workflow.name}</h2>
            <p className="text-xs text-muted-foreground">
              {startStep?.name ?? "—"}
            </p>
          </div>
        </div>
        <Card>
          <div className="p-6">
            <StepAction
              form={form}
              actions={actions}
              submitting={submitting}
              onAct={handleAct}
            />
          </div>
        </Card>
      </div>
    );
  }

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
