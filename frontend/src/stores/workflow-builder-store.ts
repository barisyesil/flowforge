import { create } from "zustand";

import {
  createStep,
  createTransition,
  createEmptyWorkflow,
} from "@/lib/workflow-factory";
import type {
  WorkflowDefinition,
  WorkflowStep,
  Transition,
} from "@/types/workflow";

type WorkflowBuilderState = {
  workflow: WorkflowDefinition;
  selectedStepId: string | null;
  stepSeq: number;

  setName: (name: string) => void;
  setDescription: (description: string) => void;

  addStep: () => void;
  removeStep: (id: string) => void;
  updateStep: (id: string, patch: Partial<WorkflowStep>) => void;
  selectStep: (id: string | null) => void;
  reorderSteps: (activeId: string, overId: string) => void;

  addTransition: (stepId: string) => void;
  updateTransition: (
    stepId: string,
    transitionId: string,
    patch: Partial<Transition>,
  ) => void;
  removeTransition: (stepId: string, transitionId: string) => void;

  loadWorkflow: (workflow: WorkflowDefinition) => void;
  resetWorkflow: () => void;
};

/** updatedAt'i güncel tutar ve başlangıç adımını ilk adıma sabitler. */
function touch(workflow: WorkflowDefinition): WorkflowDefinition {
  return {
    ...workflow,
    startStepId: workflow.steps[0]?.id ?? null,
    updatedAt: new Date().toISOString(),
  };
}

function mapStep(
  workflow: WorkflowDefinition,
  stepId: string,
  fn: (step: WorkflowStep) => WorkflowStep,
): WorkflowDefinition {
  return touch({
    ...workflow,
    steps: workflow.steps.map((s) => (s.id === stepId ? fn(s) : s)),
  });
}

export const useWorkflowBuilderStore = create<WorkflowBuilderState>((set) => ({
  workflow: createEmptyWorkflow(),
  selectedStepId: null,
  stepSeq: 1,

  setName: (name) => set((s) => ({ workflow: touch({ ...s.workflow, name }) })),
  setDescription: (description) =>
    set((s) => ({ workflow: touch({ ...s.workflow, description }) })),

  addStep: () =>
    set((s) => {
      const index = s.stepSeq + 1;
      const step = createStep(index);
      return {
        stepSeq: index,
        selectedStepId: step.id,
        workflow: touch({ ...s.workflow, steps: [...s.workflow.steps, step] }),
      };
    }),

  removeStep: (id) =>
    set((s) => ({
      selectedStepId: s.selectedStepId === id ? null : s.selectedStepId,
      workflow: touch({
        ...s.workflow,
        steps: s.workflow.steps
          .filter((step) => step.id !== id)
          // Silinen adıma giden geçişleri "tamamlandı" bitişine çevir.
          .map((step) => ({
            ...step,
            transitions: step.transitions.map((tr) =>
              tr.target.type === "step" && tr.target.stepId === id
                ? { ...tr, target: { type: "end", outcome: "completed" } }
                : tr,
            ),
          })),
      }),
    })),

  updateStep: (id, patch) =>
    set((s) => ({ workflow: mapStep(s.workflow, id, (step) => ({ ...step, ...patch })) })),

  selectStep: (id) => set({ selectedStepId: id }),

  reorderSteps: (activeId, overId) =>
    set((s) => {
      if (activeId === overId) return s;
      const steps = [...s.workflow.steps];
      const from = steps.findIndex((x) => x.id === activeId);
      const to = steps.findIndex((x) => x.id === overId);
      if (from === -1 || to === -1) return s;
      const [moved] = steps.splice(from, 1);
      steps.splice(to, 0, moved);
      return { workflow: touch({ ...s.workflow, steps }) };
    }),

  addTransition: (stepId) =>
    set((s) => ({
      workflow: mapStep(s.workflow, stepId, (step) => ({
        ...step,
        transitions: [...step.transitions, createTransition()],
      })),
    })),

  updateTransition: (stepId, transitionId, patch) =>
    set((s) => ({
      workflow: mapStep(s.workflow, stepId, (step) => ({
        ...step,
        transitions: step.transitions.map((tr) =>
          tr.id === transitionId ? { ...tr, ...patch } : tr,
        ),
      })),
    })),

  removeTransition: (stepId, transitionId) =>
    set((s) => ({
      workflow: mapStep(s.workflow, stepId, (step) => ({
        ...step,
        transitions: step.transitions.filter((tr) => tr.id !== transitionId),
      })),
    })),

  loadWorkflow: (workflow) =>
    set({
      workflow,
      selectedStepId: workflow.steps[0]?.id ?? null,
      stepSeq: workflow.steps.length,
    }),

  resetWorkflow: () =>
    set({ workflow: createEmptyWorkflow(), selectedStepId: null, stepSeq: 1 }),
}));
