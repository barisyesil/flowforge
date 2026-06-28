"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SimpleSelect } from "@/components/common/simple-select";
import { useWorkflowBuilderStore } from "@/stores/workflow-builder-store";
import { useFormsStore } from "@/stores/forms-store";
import { useRolesStore } from "@/stores/roles-store";
import { useUsersStore } from "@/stores/users-store";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useRoleLabel } from "@/hooks/use-role-label";

const NONE = "__none__";

export function NodePanel() {
  const { t } = useTranslation();
  const roleLabel = useRoleLabel();

  const step = useWorkflowBuilderStore((s) =>
    s.workflow.steps.find((x) => x.id === s.selectedStepId),
  );
  const updateStep = useWorkflowBuilderStore((s) => s.updateStep);
  const forms = useFormsStore((s) => s.forms);
  const roles = useRolesStore((s) => s.roles);
  const users = useUsersStore((s) => s.users);

  if (!step) return null;

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

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">{t("wf.stepInspector")}</h3>

      <div className="space-y-1.5">
        <Label htmlFor="np-name">{t("wf.stepName")}</Label>
        <Input
          id="np-name"
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
  );
}
