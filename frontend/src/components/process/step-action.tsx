"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FieldInput } from "@/components/form-runner/field-input";
import {
  evaluateForm,
  validateForm,
  buildSubmission,
  type FieldErrors,
} from "@/lib/form-engine";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { FormDefinition, FormSubmission, FieldValue } from "@/types/form";

const EMPTY = {
  hiddenFieldIds: new Set<string>(),
  requiredFieldIds: new Set<string>(),
};

/**
 * Bir adımı işleme bileşeni: (varsa) adım formunu doldurur ve geçiş aksiyonu
 * butonlarını gösterir. Aksiyon seçilince form doğrulanır ve onAct çağrılır.
 */
export function StepAction({
  form,
  actions,
  submitting,
  onAct,
}: {
  form?: FormDefinition;
  actions: string[];
  submitting: boolean;
  onAct: (action: string, data: FormSubmission) => void;
}) {
  const { t } = useTranslation();
  const [values, setValues] = useState<FormSubmission>({});
  const [errors, setErrors] = useState<FieldErrors>({});

  const { hiddenFieldIds, requiredFieldIds } = useMemo(
    () => (form ? evaluateForm(form, values) : EMPTY),
    [form, values],
  );

  function setValue(name: string, value: FieldValue) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleAct(action: string) {
    if (form) {
      const validationErrors = validateForm(form, values);
      setErrors(validationErrors);
      if (Object.keys(validationErrors).length > 0) {
        toast.error(t("runner.fixErrors"));
        return;
      }
      onAct(action, buildSubmission(form, values));
    } else {
      onAct(action, {});
    }
  }

  const visibleFields = form
    ? form.fields.filter((f) => !hiddenFieldIds.has(f.id))
    : [];

  return (
    <div className="space-y-5">
      {form ? (
        visibleFields.map((field) => (
          <FieldInput
            key={field.id}
            field={field}
            value={values[field.name]}
            required={requiredFieldIds.has(field.id)}
            error={errors[field.name]}
            onChange={(value) => setValue(field.name, value)}
          />
        ))
      ) : (
        <p className="text-sm text-muted-foreground">{t("step.noForm")}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button
            key={action}
            disabled={submitting}
            onClick={() => handleAct(action)}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {action}
          </Button>
        ))}
      </div>
    </div>
  );
}
