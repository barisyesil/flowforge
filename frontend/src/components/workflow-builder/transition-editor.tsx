"use client";

import { Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SimpleSelect } from "@/components/common/simple-select";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { Transition, TransitionTarget, StepCondition } from "@/types/workflow";
import type { RuleOperator } from "@/types/form";

const NONE = "__none__";
const END_COMPLETED = "__end_completed__";
const END_REJECTED = "__end_rejected__";

export type AvailableField = {
  name: string;
  label: string;
  options?: { value: string; label: string }[];
};

export function TransitionEditor({
  transition,
  steps,
  availableFields,
  onChange,
  onRemove,
}: {
  transition: Transition;
  steps: { id: string; name: string }[];
  availableFields: AvailableField[];
  onChange: (patch: Partial<Transition>) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const cond = transition.condition;

  const targetValue =
    transition.target.type === "end"
      ? transition.target.outcome === "completed"
        ? END_COMPLETED
        : END_REJECTED
      : transition.target.stepId;

  const targetOptions = [
    ...steps.map((s) => ({ value: s.id, label: s.name })),
    { value: END_COMPLETED, label: t("wf.endCompleted") },
    { value: END_REJECTED, label: t("wf.endRejected") },
  ];

  function setTarget(v: string) {
    let target: TransitionTarget;
    if (v === END_COMPLETED) target = { type: "end", outcome: "completed" };
    else if (v === END_REJECTED) target = { type: "end", outcome: "rejected" };
    else target = { type: "step", stepId: v };
    onChange({ target });
  }

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
  const selectedField = availableFields.find((f) => f.name === cond?.fieldName);
  const needsValue =
    cond && (cond.operator === "equals" || cond.operator === "notEquals");

  function setConditionField(v: string) {
    if (v === NONE) {
      onChange({ condition: undefined });
      return;
    }
    onChange({
      condition: {
        fieldName: v,
        operator: cond?.operator ?? "equals",
        value: cond?.value,
      },
    });
  }
  function patchCondition(patch: Partial<StepCondition>) {
    if (!cond) return;
    onChange({ condition: { ...cond, ...patch } });
  }

  return (
    <div className="space-y-2 rounded-lg border bg-muted/30 p-2.5">
      <div className="flex items-center gap-2">
        <Input
          className="h-8"
          value={transition.label}
          placeholder={t("wf.transitionLabel")}
          onChange={(e) => onChange({ label: e.target.value })}
        />
        <Button variant="ghost" size="icon-sm" onClick={onRemove}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-muted-foreground">{t("wf.if")}</span>
        <SimpleSelect
          className="h-8 w-32"
          value={cond?.fieldName ?? NONE}
          onValueChange={setConditionField}
          options={fieldOptions}
          placeholder={t("wf.condition")}
        />
        {cond && (
          <SimpleSelect
            className="h-8 w-40"
            value={cond.operator}
            onValueChange={(v) => patchCondition({ operator: v as RuleOperator })}
            options={operatorOptions}
          />
        )}
        {cond &&
          needsValue &&
          (selectedField?.options?.length ? (
            <SimpleSelect
              className="h-8 w-28"
              value={cond.value ?? ""}
              onValueChange={(v) => patchCondition({ value: v })}
              options={selectedField.options}
              placeholder={t("wf.valuePlaceholder")}
            />
          ) : (
            <Input
              className="h-8 w-28"
              value={cond.value ?? ""}
              placeholder={t("wf.valuePlaceholder")}
              onChange={(e) => patchCondition({ value: e.target.value })}
            />
          ))}
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">{t("wf.target")}</span>
        <SimpleSelect
          className="h-8 flex-1"
          value={targetValue}
          onValueChange={setTarget}
          options={targetOptions}
        />
      </div>
    </div>
  );
}
