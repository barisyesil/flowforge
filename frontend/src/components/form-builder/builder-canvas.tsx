"use client";

import { ArrowUp, ArrowDown, Trash2, MousePointerClick } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fieldTypeMap } from "@/lib/form-fields";
import { useFormBuilderStore } from "@/stores/form-builder-store";

/**
 * Orta alan: tasarlanan formun alanları. Her satır seçilebilir; üzerine gelince
 * sıralama (yukarı/aşağı) ve silme aksiyonları görünür.
 * (Sürükle-bırak sıralama bonusu sonraki adımda eklenecek.)
 */
export function BuilderCanvas() {
  const fields = useFormBuilderStore((s) => s.form.fields);
  const selectedId = useFormBuilderStore((s) => s.selectedFieldId);
  const selectField = useFormBuilderStore((s) => s.selectField);
  const moveField = useFormBuilderStore((s) => s.moveField);
  const removeField = useFormBuilderStore((s) => s.removeField);

  if (fields.length === 0) {
    return (
      <div className="flex h-full min-h-64 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center text-muted-foreground">
        <MousePointerClick className="h-6 w-6" />
        <p className="text-sm">
          Soldaki paletten alan ekleyerek formunuzu tasarlamaya başlayın.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {fields.map((field, index) => {
        const meta = fieldTypeMap[field.type];
        const active = field.id === selectedId;
        return (
          <div
            key={field.id}
            onClick={() => selectField(field.id)}
            className={cn(
              "group flex items-center gap-3 rounded-lg border p-3 transition-colors cursor-pointer",
              active
                ? "border-primary ring-1 ring-primary"
                : "hover:bg-muted/50",
            )}
          >
            <meta.icon className="h-4 w-4 shrink-0 text-muted-foreground" />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="truncate text-sm font-medium">
                  {field.label}
                </span>
                {field.required && (
                  <span className="text-destructive" title="Zorunlu">
                    *
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {meta.label} · {field.name}
              </span>
            </div>

            <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={index === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  moveField(field.id, "up");
                }}
              >
                <ArrowUp className="h-4 w-4" />
                <span className="sr-only">Yukarı taşı</span>
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={index === fields.length - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  moveField(field.id, "down");
                }}
              >
                <ArrowDown className="h-4 w-4" />
                <span className="sr-only">Aşağı taşı</span>
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  removeField(field.id);
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
                <span className="sr-only">Sil</span>
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
