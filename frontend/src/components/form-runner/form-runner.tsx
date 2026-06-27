"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle2, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FieldInput } from "@/components/form-runner/field-input";
import {
  evaluateForm,
  validateForm,
  buildSubmission,
  type FieldErrors,
} from "@/lib/form-engine";
import type { FormDefinition, FormSubmission, FieldValue } from "@/types/form";

type SubmitStatus = "idle" | "submitting" | "success" | "error";

/**
 * Formu Başlat (Adım 2): bir form tanımını render eder, veriyi toplar,
 * doğrular ve "backend'e gönderiliyormuş gibi" submit eder.
 * Başarılıysa girilen verinin JSON çıktısını gösterir (Adım 3 önizlemesi).
 */
export function FormRunner({
  form,
  onSubmit,
}: {
  form: FormDefinition;
  /** Doğrulama geçince çağrılır; hata fırlatırsa error state'e geçilir. */
  onSubmit: (data: FormSubmission) => Promise<void>;
}) {
  const [values, setValues] = useState<FormSubmission>({});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [result, setResult] = useState<FormSubmission | null>(null);

  // Görünürlük ve zorunluluk her değer değişiminde yeniden hesaplanır (canlı kurallar).
  const { hiddenFieldIds, requiredFieldIds } = useMemo(
    () => evaluateForm(form, values),
    [form, values],
  );

  function setValue(name: string, value: FieldValue) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validateForm(form, values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Lütfen formdaki hataları düzeltin.");
      return;
    }

    setStatus("submitting");
    try {
      const payload = buildSubmission(form, values);
      await onSubmit(payload);
      setResult(payload);
      setStatus("success");
      // eslint-disable-next-line no-console
      console.log("Form gönderimi (JSON):", payload);
    } catch {
      setStatus("error");
      toast.error("Gönderim sırasında bir hata oluştu.");
    }
  }

  function resetRunner() {
    setValues({});
    setErrors({});
    setResult(null);
    setStatus("idle");
  }

  if (status === "success" && result) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-500">
          <CheckCircle2 className="h-5 w-5" />
          Form gönderildi
        </div>
        <div>
          <p className="mb-1.5 text-sm text-muted-foreground">
            Girilen verinin JSON çıktısı:
          </p>
          <pre className="max-h-96 overflow-auto rounded-lg border bg-muted/50 p-4 text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
        <Button variant="outline" onClick={resetRunner}>
          <RotateCcw className="h-4 w-4" />
          Yeni gönderim
        </Button>
      </div>
    );
  }

  const visibleFields = form.fields.filter((f) => !hiddenFieldIds.has(f.id));

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      {visibleFields.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Bu formda gösterilecek alan yok.
        </p>
      )}

      {visibleFields.map((field) => (
        <FieldInput
          key={field.id}
          field={field}
          value={values[field.name]}
          required={requiredFieldIds.has(field.id)}
          error={errors[field.name]}
          onChange={(value) => setValue(field.name, value)}
        />
      ))}

      {visibleFields.length > 0 && (
        <Button type="submit" disabled={status === "submitting"}>
          {status === "submitting" && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          Gönder
        </Button>
      )}
    </form>
  );
}
