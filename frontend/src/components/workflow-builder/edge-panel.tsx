"use client";

import { useMemo } from "react";
import { Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SimpleSelect } from "@/components/common/simple-select";
import { useWorkflowBuilderStore } from "@/stores/workflow-builder-store";
import { useFormsStore } from "@/stores/forms-store";
import { useTranslation } from "@/lib/i18n/use-translation";
import { targetToNodeId } from "@/lib/workflow-graph";
import type { RuleOperator } from "@/types/form";
import type { StepCondition, TransitionTarget } from "@/types/workflow";

const NONE = "__none__";
const END_C = "__end_completed__";
const END_R = "__end_rejected__";

export function EdgePanel() {
  const { t } = useTranslation();

  const selection = useWorkflowBuilderStore((s) => s.selectedTransition);
  const steps = useWorkflowBuilderStore((s) => s.workflow.steps);
  const updateTransition = useWorkflowBuilderStore((s) => s.updateTransition);
  const removeTransition = useWorkflowBuilderStore((s) => s.removeTransition);
  const forms = useFormsStore((s) => s.forms);

  const step = selection
    ? steps.find((x) => x.id === selection.stepId)
    : undefined;
  const transition = step?.transitions.find(
    (tr) => tr.id === selection?.transitionId,
  );

  const availableFields = useMemo(() => {
    const map = new Map<
      string,
      { name: string; label: string; options?: { value: string; label: string }[] }
    >();
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

  if (!selection || !step || !transition) return null;

  const cond = transition.condition;
  const needsValue =
    cond && (cond.operator === "equals" || cond.operator === "notEquals");
  const selectedField = availableFields.find((f) => f.name === cond?.fieldName);

  const targetValue = targetToNodeId(transition.target);
  const targetOptions = [
    ...steps.map((s) => ({ value: s.id, label: s.name })),
    { value: END_C, label: t("wf.endCompleted") },
    { value: END_R, label: t("wf.endRejected") },
  ];
  const fieldOptions = [
    { value: NONE, label: t("wf.conditionNone") },
    ...availableFields.map((f) => ({ value: f.name, label: f.label })),
  ];
  const operatorOptions: { value: RuleOperator; label: string }[] = [
    { value: "equals", label: t("rules.op.equals") },
    { value: "notEquals", label: t("rules.op.notEquals") },
    { value: "isChecked", label: t("rules.op.isChecked") },
    { value: "isNotEmpty", label: t("rules.op.isNotEmpty") },
  ];

  function setTarget(v: string) {
    let target: TransitionTarget;
    if (v === END_C) target = { type: "end", outcome: "completed" };
    else if (v === END_R) target = { type: "end", outcome: "rejected" };
    else target = { type: "step", stepId: v };
    updateTransition(step!.id, transition!.id, { target });
  }
  function setConditionField(v: string) {
    if (v === NONE) {
      updateTransition(step!.id, transition!.id, { condition: undefined });
      return;
    }
    updateTransition(step!.id, transition!.id, {
      condition: {
        fieldName: v,
        operator: cond?.operator ?? "equals",
        value: cond?.value,
      },
    });
  }
  function patchCondition(patch: Partial<StepCondition>) {
    if (!cond) return;
    updateTransition(step!.id, transition!.id, {
      condition: { ...cond, ...patch },
    });
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">{t("wf.transitionInspector")}</h3>

      <div className="space-y-1.5">
        <Label htmlFor="ep-label">{t("wf.transitionLabel")}</Label>
        <Input
          id="ep-label"
          value={transition.label}
          onChange={(e) =>
            updateTransition(step.id, transition.id, { label: e.target.value })
          }
        />
      </div>

      <div className="space-y-1.5">
        <Label>{t("wf.target")}</Label>
        <SimpleSelect
          className="w-full"
          value={targetValue}
          onValueChange={setTarget}
          options={targetOptions}
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>{t("wf.condition")}</Label>
        <SimpleSelect
          className="w-full"
          value={cond?.fieldName ?? NONE}
          onValueChange={setConditionField}
          options={fieldOptions}
        />
        {cond && (
          <SimpleSelect
            className="w-full"
            value={cond.operator}
            onValueChange={(v) => patchCondition({ operator: v as RuleOperator })}
            options={operatorOptions}
          />
        )}
        {cond &&
          needsValue &&
          (selectedField?.options?.length ? (
            <SimpleSelect
              className="w-full"
              value={cond.value ?? ""}
              onValueChange={(v) => patchCondition({ value: v })}
              options={selectedField.options}
              placeholder={t("wf.valuePlaceholder")}
            />
          ) : (
            <Input
              value={cond.value ?? ""}
              placeholder={t("wf.valuePlaceholder")}
              onChange={(e) => patchCondition({ value: e.target.value })}
            />
          ))}
      </div>

      <Separator />

      <Button
        variant="outline"
        className="w-full"
        onClick={() => removeTransition(step.id, transition.id)}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
        {t("wf.deleteTransition")}
      </Button>
    </div>
  );
}
