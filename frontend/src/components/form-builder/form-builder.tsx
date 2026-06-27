"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldPalette } from "@/components/form-builder/field-palette";
import { BuilderCanvas } from "@/components/form-builder/builder-canvas";
import { FieldProperties } from "@/components/form-builder/field-properties";
import { useFormBuilderStore } from "@/stores/form-builder-store";

/**
 * Form Tasarla (Adım 1) ekranının kabuğu: üç panel.
 *   [ Palet ]  [ Canvas (alanlar) ]  [ Özellikler ]
 */
export function FormBuilder() {
  const name = useFormBuilderStore((s) => s.form.name);
  const setName = useFormBuilderStore((s) => s.setName);
  const fieldCount = useFormBuilderStore((s) => s.form.fields.length);

  return (
    <div className="space-y-4">
      {/* Form başlığı */}
      <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
        <div className="space-y-1.5">
          <Label htmlFor="form-name">Form Adı</Label>
          <Input
            id="form-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-72 font-medium"
          />
        </div>
        <span className="pb-2 text-sm text-muted-foreground">
          {fieldCount} alan
        </span>
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
    </div>
  );
}
