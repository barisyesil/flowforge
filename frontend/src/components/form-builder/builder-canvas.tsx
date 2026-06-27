"use client";

import { GripVertical, Trash2, MousePointerClick } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fieldTypeMap } from "@/lib/form-fields";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import type { FormField } from "@/types/form";

/** Tek bir sürüklenebilir alan satırı. */
function SortableFieldRow({
  field,
  active,
  onSelect,
  onRemove,
}: {
  field: FormField;
  active: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id });
  const meta = fieldTypeMap[field.type];

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        "group flex items-center gap-2 rounded-lg border bg-card p-3 transition-colors cursor-pointer",
        isDragging && "z-10 opacity-60 shadow-lg",
        active ? "border-primary ring-1 ring-primary" : "hover:bg-muted/50",
      )}
    >
      {/* Sürükleme tutamacı */}
      <button
        type="button"
        className="cursor-grab text-muted-foreground active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
        <span className="sr-only">Sürükleyerek sırala</span>
      </button>

      <meta.icon className="h-4 w-4 shrink-0 text-muted-foreground" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="truncate text-sm font-medium">{field.label}</span>
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

      <Button
        variant="ghost"
        size="icon-sm"
        className="opacity-0 transition-opacity group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
        <span className="sr-only">Sil</span>
      </Button>
    </div>
  );
}

/**
 * Orta alan: tasarlanan formun alanları. Sürükle-bırak ile sıralanır (dnd-kit),
 * tıklanınca seçilir, üzerine gelince silinebilir.
 */
export function BuilderCanvas() {
  const fields = useFormBuilderStore((s) => s.form.fields);
  const selectedId = useFormBuilderStore((s) => s.selectedFieldId);
  const selectField = useFormBuilderStore((s) => s.selectField);
  const removeField = useFormBuilderStore((s) => s.removeField);
  const reorderFields = useFormBuilderStore((s) => s.reorderFields);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderFields(String(active.id), String(over.id));
    }
  }

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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={fields.map((f) => f.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {fields.map((field) => (
            <SortableFieldRow
              key={field.id}
              field={field}
              active={field.id === selectedId}
              onSelect={() => selectField(field.id)}
              onRemove={() => removeField(field.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
