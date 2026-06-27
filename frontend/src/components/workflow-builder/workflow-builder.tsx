"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, FilePlus2, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SimpleSelect } from "@/components/common/simple-select";
import { StepList } from "@/components/workflow-builder/step-list";
import { StepEditor } from "@/components/workflow-builder/step-editor";
import { useWorkflowBuilderStore } from "@/stores/workflow-builder-store";
import { useWorkflowsStore } from "@/stores/workflows-store";
import { useFormsStore } from "@/stores/forms-store";
import { useRolesStore } from "@/stores/roles-store";
import { useUsersStore } from "@/stores/users-store";
import { useTranslation } from "@/lib/i18n/use-translation";

/** Süreç Tasarımı ekranı: [ Adım listesi ] [ Adım editörü ]. */
export function WorkflowBuilder() {
  const { t } = useTranslation();

  const workflow = useWorkflowBuilderStore((s) => s.workflow);
  const name = useWorkflowBuilderStore((s) => s.workflow.name);
  const stepCount = useWorkflowBuilderStore((s) => s.workflow.steps.length);
  const setName = useWorkflowBuilderStore((s) => s.setName);
  const resetWorkflow = useWorkflowBuilderStore((s) => s.resetWorkflow);
  const loadWorkflow = useWorkflowBuilderStore((s) => s.loadWorkflow);

  const saveWorkflow = useWorkflowsStore((s) => s.saveWorkflow);
  const workflows = useWorkflowsStore((s) => s.workflows);
  const loadWorkflows = useWorkflowsStore((s) => s.loadWorkflows);

  const loadForms = useFormsStore((s) => s.loadForms);
  const loadRoles = useRolesStore((s) => s.loadRoles);
  const loadUsers = useUsersStore((s) => s.loadUsers);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadForms();
    loadRoles();
    loadUsers();
    loadWorkflows();
  }, [loadForms, loadRoles, loadUsers, loadWorkflows]);

  async function handleSave() {
    if (!workflow.name.trim()) {
      toast.error(t("wf.nameRequired"));
      return;
    }
    if (workflow.steps.length === 0) {
      toast.error(t("wf.needStep"));
      return;
    }
    setSaving(true);
    const saved = await saveWorkflow(workflow);
    setSaving(false);
    if (saved) {
      loadWorkflow(saved);
      toast.success(
        t("wf.saved", { name: saved.name, version: saved.version }),
      );
    } else {
      toast.error(t("wf.saveFailed"));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="wf-name">{t("wf.name")}</Label>
            <Input
              id="wf-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-72 font-medium"
            />
          </div>
          <span className="pb-2 text-sm text-muted-foreground">
            {t("wf.steps", { count: stepCount })}
          </span>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          {workflows.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs font-normal text-muted-foreground">
                {t("wf.savedWorkflows")}
              </Label>
              <SimpleSelect
                className="w-48"
                value={
                  workflows.some((w) => w.id === workflow.id) ? workflow.id : ""
                }
                onValueChange={(id) => {
                  const w = workflows.find((x) => x.id === id);
                  if (w) loadWorkflow(w);
                }}
                options={workflows.map((w) => ({ value: w.id, label: w.name }))}
                placeholder={t("wf.loadToEdit")}
              />
            </div>
          )}
          <Button variant="outline" onClick={resetWorkflow}>
            <FilePlus2 className="h-4 w-4" />
            {t("wf.new")}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {t("common.save")}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="h-fit rounded-xl border bg-card p-3">
          <StepList />
        </div>
        <div className="min-h-96 rounded-xl border bg-card p-4">
          <StepEditor />
        </div>
      </div>
    </div>
  );
}
