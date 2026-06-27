"use client";

import { Button } from "@/components/ui/button";
import { fieldTypeMetas } from "@/lib/form-fields";
import { useFormBuilderStore } from "@/stores/form-builder-store";

/**
 * Sol palet: tıklanınca canvas'a o tipte yeni alan ekler.
 * (Sürükle-bırak ile ekleme bonusu sonraki adımda buraya eklenecek.)
 */
export function FieldPalette() {
  const addField = useFormBuilderStore((s) => s.addField);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Alan Ekle</h3>
      <div className="grid grid-cols-2 gap-2">
        {fieldTypeMetas.map((meta) => (
          <Button
            key={meta.type}
            variant="outline"
            className="h-auto flex-col gap-1.5 py-3"
            onClick={() => addField(meta.type)}
          >
            <meta.icon className="h-4 w-4" />
            <span className="text-xs font-normal">{meta.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
