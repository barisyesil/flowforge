"use client";

import { Plus, Trash2, SlidersHorizontal } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fieldTypeMap } from "@/lib/form-fields";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import type { FieldValidation } from "@/types/form";

export function FieldProperties() {
  const field = useFormBuilderStore((s) =>
    s.form.fields.find((f) => f.id === s.selectedFieldId),
  );
  const updateField = useFormBuilderStore((s) => s.updateField);
  const addOption = useFormBuilderStore((s) => s.addOption);
  const updateOption = useFormBuilderStore((s) => s.updateOption);
  const removeOption = useFormBuilderStore((s) => s.removeOption);

  if (!field) {
    return (
      <div className="flex h-full min-h-48 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
        <SlidersHorizontal className="h-5 w-5" />
        <p className="text-sm">
          Özelliklerini düzenlemek için bir alan seçin.
        </p>
      </div>
    );
  }

  const meta = fieldTypeMap[field.type];

  function setValidation(patch: Partial<FieldValidation>) {
    updateField(field!.id, {
      validation: { ...field!.validation, ...patch },
    });
  }

  /** Sayısal alan için: boşsa undefined, doluysa number. */
  function numOrUndef(value: string): number | undefined {
    return value === "" ? undefined : Number(value);
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-muted-foreground">{meta.label} alanı</p>
        <h3 className="text-sm font-medium">Özellikler</h3>
      </div>

      {/* Etiket */}
      <div className="space-y-1.5">
        <Label htmlFor="prop-label">Etiket</Label>
        <Input
          id="prop-label"
          value={field.label}
          onChange={(e) => updateField(field.id, { label: e.target.value })}
        />
      </div>

      {/* Makine adı */}
      <div className="space-y-1.5">
        <Label htmlFor="prop-name">Alan Adı (JSON anahtarı)</Label>
        <Input
          id="prop-name"
          value={field.name}
          onChange={(e) => updateField(field.id, { name: e.target.value })}
          className="font-mono text-xs"
        />
      </div>

      {/* Zorunlu */}
      <div className="flex items-center justify-between">
        <Label htmlFor="prop-required">Zorunlu alan</Label>
        <Switch
          id="prop-required"
          checked={field.required}
          onCheckedChange={(checked) =>
            updateField(field.id, { required: checked })
          }
        />
      </div>

      {/* Placeholder */}
      {field.type !== "checkbox" && field.type !== "radio" && (
        <div className="space-y-1.5">
          <Label htmlFor="prop-placeholder">Placeholder</Label>
          <Input
            id="prop-placeholder"
            value={field.placeholder ?? ""}
            onChange={(e) =>
              updateField(field.id, { placeholder: e.target.value })
            }
          />
        </div>
      )}

      {/* Yardım metni */}
      <div className="space-y-1.5">
        <Label htmlFor="prop-help">Açıklama (yardım metni)</Label>
        <Input
          id="prop-help"
          value={field.helpText ?? ""}
          onChange={(e) => updateField(field.id, { helpText: e.target.value })}
        />
      </div>

      {/* Seçenekler (select / radio) */}
      {meta.hasOptions && (
        <>
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Seçenekler</Label>
              <Button
                variant="outline"
                size="xs"
                onClick={() => addOption(field.id)}
              >
                <Plus className="h-3.5 w-3.5" />
                Ekle
              </Button>
            </div>
            <div className="space-y-2">
              {(field.options ?? []).map((option) => (
                <div key={option.id} className="flex items-center gap-1.5">
                  <Input
                    aria-label="Seçenek etiketi"
                    value={option.label}
                    onChange={(e) =>
                      updateOption(field.id, option.id, {
                        label: e.target.value,
                      })
                    }
                    placeholder="Etiket"
                    className="h-8"
                  />
                  <Input
                    aria-label="Seçenek değeri"
                    value={option.value}
                    onChange={(e) =>
                      updateOption(field.id, option.id, {
                        value: e.target.value,
                      })
                    }
                    placeholder="değer"
                    className="h-8 w-28 font-mono text-xs"
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeOption(field.id, option.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Tip bazlı validasyon */}
      {(meta.hasTextValidation || meta.hasNumberValidation) && (
        <>
          <Separator />
          <div className="space-y-3">
            <Label>Doğrulama</Label>

            {meta.hasTextValidation && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="prop-minlen" className="text-xs font-normal">
                    Min. uzunluk
                  </Label>
                  <Input
                    id="prop-minlen"
                    type="number"
                    value={field.validation?.minLength ?? ""}
                    onChange={(e) =>
                      setValidation({ minLength: numOrUndef(e.target.value) })
                    }
                    className="h-8"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prop-maxlen" className="text-xs font-normal">
                    Maks. uzunluk
                  </Label>
                  <Input
                    id="prop-maxlen"
                    type="number"
                    value={field.validation?.maxLength ?? ""}
                    onChange={(e) =>
                      setValidation({ maxLength: numOrUndef(e.target.value) })
                    }
                    className="h-8"
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="prop-pattern" className="text-xs font-normal">
                    Regex deseni (pattern)
                  </Label>
                  <Input
                    id="prop-pattern"
                    value={field.validation?.pattern ?? ""}
                    onChange={(e) =>
                      setValidation({ pattern: e.target.value || undefined })
                    }
                    className="h-8 font-mono text-xs"
                  />
                </div>
              </div>
            )}

            {meta.hasNumberValidation && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="prop-min" className="text-xs font-normal">
                    Min. değer
                  </Label>
                  <Input
                    id="prop-min"
                    type="number"
                    value={field.validation?.min ?? ""}
                    onChange={(e) =>
                      setValidation({ min: numOrUndef(e.target.value) })
                    }
                    className="h-8"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prop-max" className="text-xs font-normal">
                    Maks. değer
                  </Label>
                  <Input
                    id="prop-max"
                    type="number"
                    value={field.validation?.max ?? ""}
                    onChange={(e) =>
                      setValidation({ max: numOrUndef(e.target.value) })
                    }
                    className="h-8"
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
