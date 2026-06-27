"use client";

import { GripVertical, Trash2, Plus, Flag } from "lucide-react";
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
import { useWorkflowBuilderStore } from "@/stores/workflow-builder-store";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { WorkflowStep } from "@/types/workflow";

function SortableStepRow({
  step,
  index,
  active,
  onSelect,
  onRemove,
}: {
  step: WorkflowStep;
  index: number;
  active: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: step.id });
  const { t } = useTranslation();

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={onSelect}
      className={cn(
        "group flex items-center gap-2 rounded-lg border bg-card p-2.5 transition-colors cursor-pointer",
        isDragging && "z-10 opacity-60 shadow-lg",
        active ? "border-primary ring-1 ring-primary" : "hover:bg-muted/50",
      )}
    >
      <button
        type="button"
        className="cursor-grab text-muted-foreground active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
        <span className="sr-only">{t("wf.dragReorder")}</span>
      </button>
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
        {index + 1}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">
        {step.name}
      </span>
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
        <span className="sr-only">{t("wf.delete")}</span>
      </Button>
    </div>
  );
}

export function StepList() {
  const { t } = useTranslation();
  const steps = useWorkflowBuilderStore((s) => s.workflow.steps);
  const selectedId = useWorkflowBuilderStore((s) => s.selectedStepId);
  const selectStep = useWorkflowBuilderStore((s) => s.selectStep);
  const removeStep = useWorkflowBuilderStore((s) => s.removeStep);
  const reorderSteps = useWorkflowBuilderStore((s) => s.reorderSteps);
  const addStep = useWorkflowBuilderStore((s) => s.addStep);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderSteps(String(active.id), String(over.id));
    }
  }

  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={steps.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {steps.map((step, index) => (
            <SortableStepRow
              key={step.id}
              step={step}
              index={index}
              active={step.id === selectedId}
              onSelect={() => selectStep(step.id)}
              onRemove={() => removeStep(step.id)}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Bitiş göstergesi */}
      <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
        <Flag className="h-3.5 w-3.5" />
        {t("wf.endCompleted")} / {t("wf.endRejected")}
      </div>

      <Button variant="outline" className="w-full" onClick={addStep}>
        <Plus className="h-4 w-4" />
        {t("wf.addStep")}
      </Button>
    </div>
  );
}
