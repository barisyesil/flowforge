"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Check, Circle, CircleDot } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/process/status-badge";
import { StepAction } from "@/components/process/step-action";
import { useProcessesStore } from "@/stores/processes-store";
import { useFormsStore } from "@/stores/forms-store";
import { useUsersStore } from "@/stores/users-store";
import { useAuthStore } from "@/stores/auth-store";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useRoleLabel } from "@/hooks/use-role-label";
import {
  stepById,
  actionLabels,
  canActOnStep,
  isMyTask,
} from "@/lib/workflow-engine";
import type { WorkflowStep } from "@/types/workflow";
import type { FormSubmission } from "@/types/form";

export default function ProcessDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const { t } = useTranslation();
  const roleLabel = useRoleLabel();

  const processes = useProcessesStore((s) => s.processes);
  const status = useProcessesStore((s) => s.status);
  const loadProcesses = useProcessesStore((s) => s.loadProcesses);
  const applyAction = useProcessesStore((s) => s.applyAction);
  const forms = useFormsStore((s) => s.forms);
  const loadForms = useFormsStore((s) => s.loadForms);
  const users = useUsersStore((s) => s.users);
  const loadUsers = useUsersStore((s) => s.loadUsers);
  const user = useAuthStore((s) => s.user);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProcesses();
    loadForms();
    loadUsers();
  }, [loadProcesses, loadForms, loadUsers]);

  const process = processes.find((p) => p.id === id);

  if (!process) {
    if (status === "loading") {
      return <Skeleton className="h-64 w-full max-w-3xl" />;
    }
    return (
      <Card>
        <div className="space-y-3 p-6">
          <p className="text-sm">{t("detail.notFound")}</p>
          <Button
            variant="outline"
            render={<Link href="/processes">{t("detail.backToList")}</Link>}
          />
        </div>
      </Card>
    );
  }

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

  const currentStep = stepById(process.workflow, process.currentStepId);
  const canAct =
    process.status === "in_progress" &&
    !!currentStep &&
    !!user &&
    canActOnStep(currentStep, user);
  const stepForm =
    currentStep?.formId !== undefined
      ? forms.find((f) => f.id === currentStep.formId)
      : undefined;
  const actions = currentStep ? actionLabels(currentStep) : [];

  async function handleAct(action: string, data: FormSubmission) {
    if (!user || !process) return;
    setSubmitting(true);
    const updated = await applyAction(process.id, action, data, user.displayName);
    setSubmitting(false);
    if (updated) toast.success(t("detail.actionApplied", { action }));
    else toast.error(t("detail.actionFailed"));
  }

  const meta = [
    { label: t("detail.workflow"), value: `${process.workflow.name} (v${process.workflow.version})` },
    { label: t("detail.startedBy"), value: process.startedByName },
    { label: t("detail.processId"), value: process.id, mono: true },
    { label: t("detail.startDate"), value: new Date(process.createdAt).toLocaleString() },
    { label: t("detail.updatedDate"), value: new Date(process.updatedAt).toLocaleString() },
  ];

  const stepsWithData = process.workflow.steps.filter(
    (s) => process.data[s.id] !== undefined,
  );

  return (
    <div className="max-w-3xl space-y-5">
      {/* Başlık */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          render={
            <Link href="/processes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          }
        />
        <div className="flex flex-1 items-center gap-2">
          <h2 className="text-lg font-semibold">{process.workflow.name}</h2>
          <StatusBadge status={process.status} />
        </div>
      </div>

      {/* Meta */}
      <Card>
        <div className="p-5">
          <dl className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
            {meta.map((m) => (
              <div key={m.label}>
                <dt className="text-xs text-muted-foreground">{m.label}</dt>
                <dd className={m.mono ? "font-mono text-xs break-all" : "text-sm"}>
                  {m.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Card>

      {/* Aktif görev: işleme */}
      {canAct && currentStep && (
        <Card>
          <div className="space-y-3 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-medium">{currentStep.name}</h3>
              {user && isMyTask(currentStep, user) && (
                <Badge variant="secondary">{t("detail.yourTask")}</Badge>
              )}
            </div>
            <StepAction
              form={stepForm}
              actions={actions}
              submitting={submitting}
              onAct={handleAct}
            />
          </div>
        </Card>
      )}

      {process.status !== "in_progress" && (
        <p className="text-sm text-muted-foreground">{t("detail.finished")}</p>
      )}

      {/* Adımlar (stepper) */}
      <Card>
        <div className="p-5">
          <h3 className="mb-3 text-sm font-medium">{t("detail.steps")}</h3>
          <ol className="space-y-2">
            {process.workflow.steps.map((step) => {
              const done = process.data[step.id] !== undefined;
              const current = step.id === process.currentStepId;
              return (
                <li key={step.id} className="flex items-center gap-3">
                  {done ? (
                    <Check className="h-4 w-4 shrink-0 text-green-600 dark:text-green-500" />
                  ) : current ? (
                    <CircleDot className="h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm",
                        current ? "font-medium" : "font-normal",
                      )}
                    >
                      {step.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("detail.assignee")}: {assigneeLabel(step)}
                    </p>
                  </div>
                  {current && (
                    <Badge variant="outline" className="font-normal">
                      {t("detail.currentStep")}
                    </Badge>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </Card>

      {/* Adım verileri (JSON) */}
      {stepsWithData.length > 0 && (
        <Card>
          <div className="space-y-3 p-5">
            <h3 className="text-sm font-medium">{t("detail.formData")}</h3>
            {stepsWithData.map((step) => (
              <div key={step.id}>
                <p className="mb-1 text-xs text-muted-foreground">
                  {t("detail.stepData", { step: step.name })}
                </p>
                <pre className="max-h-72 overflow-auto rounded-lg border bg-muted/50 p-3 text-xs">
                  {JSON.stringify(process.data[step.id], null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Geçmiş */}
      <Card>
        <div className="p-5">
          <h3 className="mb-3 text-sm font-medium">{t("detail.history")}</h3>
          <ol className="space-y-3">
            {[...process.history].reverse().map((ev) => (
              <li key={ev.id} className="flex gap-3 text-sm">
                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div>
                  <p>
                    <span className="font-medium">{ev.actorName}</span>{" "}
                    {ev.action === "start"
                      ? t("detail.started")
                      : ev.outcome
                        ? `${ev.action} · ${t("detail.ended")} (${t(`status.${ev.outcome}`)})`
                        : `${ev.action} · ${t("detail.movedTo", { step: ev.toStepName ?? "" })}`}{" "}
                    <span className="text-muted-foreground">— {ev.stepName}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(ev.at).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Card>
    </div>
  );
}
