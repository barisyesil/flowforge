"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Save, FilePlus2, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldPalette } from "@/components/form-builder/field-palette";
import { BuilderCanvas } from "@/components/form-builder/builder-canvas";
import { FieldProperties } from "@/components/form-builder/field-properties";
import { RulesEditor } from "@/components/form-builder/rules-editor";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import { useFormsStore } from "@/stores/forms-store";
import { useTranslation } from "@/lib/i18n/use-translation";

/**
 * Form Tasarla (Adım 1) ekranının kabuğu: üç panel.
 *   [ Palet ]  [ Canvas (alanlar) ]  [ Özellikler ]
 */
export function FormBuilder() {
  const name = useFormBuilderStore((s) => s.form.name);
  const setName = useFormBuilderStore((s) => s.setName);
  const fieldCount = useFormBuilderStore((s) => s.form.fields.length);
  const form = useFormBuilderStore((s) => s.form);
  const resetForm = useFormBuilderStore((s) => s.resetForm);
  const saveForm = useFormsStore((s) => s.saveForm);
  const { t } = useTranslation();

  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error(t("builder.nameRequired"));
      return;
    }
    if (form.fields.length === 0) {
      toast.error(t("builder.needField"));
      return;
    }
    setSaving(true);
    const saved = await saveForm(form);
    setSaving(false);
    if (saved) {
      toast.success(
        t("builder.saved", { name: saved.name, version: saved.version }),
      );
    } else {
      toast.error(t("builder.saveFailed"));
    }
  }

  return (
    <div className="space-y-4">
      {/* Form başlığı + aksiyonlar */}
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
          <div className="space-y-1.5">
            <Label htmlFor="form-name">{t("builder.formName")}</Label>
            <Input
              id="form-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-72 font-medium"
            />
          </div>
          <span className="pb-2 text-sm text-muted-foreground">
            {t("builder.fields", { count: fieldCount })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={resetForm}>
            <FilePlus2 className="h-4 w-4" />
            {t("common.newForm")}
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

      {/* Üç panel */}
      <div className="grid gap-4 lg:grid-cols-[220px_1fr_340px]">
        <div className="h-fit rounded-xl border bg-card p-4">
          <FieldPalette />
        </div>
        <div className="min-h-96 rounded-xl border bg-card p-4">
          <BuilderCanvas />
        </div>
        <div className="h-fit rounded-xl border bg-card p-4">
          <FieldProperties />
        </div>
      </div>

      {/* Koşullu mantık kuralları */}
      <RulesEditor />
    </div>
  );
}
