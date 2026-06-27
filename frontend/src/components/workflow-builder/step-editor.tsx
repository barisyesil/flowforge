"use client";

import { useMemo } from "react";
import { Plus, SlidersHorizontal } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SimpleSelect } from "@/components/common/simple-select";
import {
  TransitionEditor,
  type AvailableField,
} from "@/components/workflow-builder/transition-editor";
import { useWorkflowBuilderStore } from "@/stores/workflow-builder-store";
import { useFormsStore } from "@/stores/forms-store";
import { useRolesStore } from "@/stores/roles-store";
import { useUsersStore } from "@/stores/users-store";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useRoleLabel } from "@/hooks/use-role-label";

const NONE = "__none__";

export function StepEditor() {
  const { t } = useTranslation();
  const roleLabel = useRoleLabel();

  const step = useWorkflowBuilderStore((s) =>
    s.workflow.steps.find((x) => x.id === s.selectedStepId),
  );
  const steps = useWorkflowBuilderStore((s) => s.workflow.steps);
  const updateStep = useWorkflowBuilderStore((s) => s.updateStep);
  const addTransition = useWorkflowBuilderStore((s) => s.addTransition);
  const updateTransition = useWorkflowBuilderStore((s) => s.updateTransition);
  const removeTransition = useWorkflowBuilderStore((s) => s.removeTransition);

  const forms = useFormsStore((s) => s.forms);
  const roles = useRolesStore((s) => s.roles);
  const users = useUsersStore((s) => s.users);

  // Koşullarda kullanılabilecek alanlar: workflow'a bağlı tüm formların alanları.
  const availableFields = useMemo<AvailableField[]>(() => {
    const map = new Map<string, AvailableField>();
    for (const st of steps) {
      if (!st.formId) continue;
      const form = forms.find((f) => f.id === st.formId);
      form?.fields.forEach((f) => {
        if (!map.has(f.name)) {
          map.set(f.name, {
            name: f.name,
            label: f.label,
            options: f.options?.map((o) => ({ value: o.value, label: o.label })),
          });
        }
      });
    }
    return [...map.values()];
  }, [steps, forms]);

  if (!step) {
    return (
      <div className="flex h-full min-h-48 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
        <SlidersHorizontal className="h-5 w-5" />
        <p className="text-sm">{t("wf.selectStep")}</p>
      </div>
    );
  }

  const formOptions = [
    { value: NONE, label: t("wf.formNone") },
    ...forms.map((f) => ({ value: f.id, label: f.name })),
  ];
  const roleOptions = [
    { value: NONE, label: t("wf.assigneeNone") },
    ...roles.map((r) => ({ value: r.id, label: roleLabel(r.id) })),
  ];
  const userOptions = [
    { value: NONE, label: t("wf.assigneeNone") },
    ...users.map((u) => ({ value: u.id, label: u.displayName })),
  ];
  const stepOptions = steps.map((s) => ({ id: s.id, name: s.name }));

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="step-name">{t("wf.stepName")}</Label>
        <Input
          id="step-name"
          value={step.name}
          onChange={(e) => updateStep(step.id, { name: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label>{t("wf.form")}</Label>
        <SimpleSelect
          className="w-full"
          value={step.formId ?? NONE}
          onValueChange={(v) =>
            updateStep(step.id, { formId: v === NONE ? undefined : v })
          }
          options={formOptions}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{t("wf.assigneeRole")}</Label>
          <SimpleSelect
            className="w-full"
            value={step.assigneeRole ?? NONE}
            onValueChange={(v) =>
              updateStep(step.id, { assigneeRole: v === NONE ? undefined : v })
            }
            options={roleOptions}
          />
        </div>
        <div className="space-y-1.5">
          <Label>{t("wf.assigneeUser")}</Label>
          <SimpleSelect
            className="w-full"
            value={step.assigneeUserId ?? NONE}
            onValueChange={(v) =>
              updateStep(step.id, { assigneeUserId: v === NONE ? undefined : v })
            }
            options={userOptions}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>{t("wf.transitions")}</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addTransition(step.id)}
          >
            <Plus className="h-4 w-4" />
            {t("wf.addTransition")}
          </Button>
        </div>
        <div className="space-y-2">
          {step.transitions.map((transition) => (
            <TransitionEditor
              key={transition.id}
              transition={transition}
              steps={stepOptions}
              availableFields={availableFields}
              onChange={(patch) =>
                updateTransition(step.id, transition.id, patch)
              }
              onRemove={() => removeTransition(step.id, transition.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
