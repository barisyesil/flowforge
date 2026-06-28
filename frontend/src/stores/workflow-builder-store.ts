import { create } from "zustand";

import { createStep, createTransition, createEmptyWorkflow } from "@/lib/workflow-factory";
import type {
  WorkflowDefinition,
  WorkflowStep,
  Transition,
  TransitionTarget,
} from "@/types/workflow";

type Selection = { stepId: string; transitionId: string };

type WorkflowBuilderState = {
  workflow: WorkflowDefinition;
  selectedStepId: string | null;
  selectedTransition: Selection | null;
  stepSeq: number;

  setName: (name: string) => void;

  // Adımlar
  addStepAt: (position: { x: number; y: number }) => void;
  removeStep: (id: string) => void;
  updateStep: (id: string, patch: Partial<WorkflowStep>) => void;

  // Graph
  setNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  setStartStep: (stepId: string) => void;
  connectTransition: (sourceStepId: string, target: TransitionTarget) => void;

  // Geçişler
  updateTransition: (stepId: string, transitionId: string, patch: Partial<Transition>) => void;
  removeTransition: (stepId: string, transitionId: string) => void;

  // Seçim
  selectStep: (id: string | null) => void;
  selectTransition: (selection: Selection | null) => void;
  clearSelection: () => void;

  loadWorkflow: (workflow: WorkflowDefinition) => void;
  resetWorkflow: () => void;
};

function touch(workflow: WorkflowDefinition): WorkflowDefinition {
  return { ...workflow, updatedAt: new Date().toISOString() };
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
  selectedTransition: null,
  stepSeq: 1,

  setName: (name) => set((s) => ({ workflow: touch({ ...s.workflow, name }) })),

  addStepAt: (position) =>
    set((s) => {
      const index = s.stepSeq + 1;
      const step = createStep(index);
      const layout = { ...(s.workflow.layout ?? {}), [step.id]: position };
      const firstStep = s.workflow.steps.length === 0;
      return {
        stepSeq: index,
        selectedStepId: step.id,
        selectedTransition: null,
        workflow: touch({
          ...s.workflow,
          steps: [...s.workflow.steps, step],
          layout,
          startStepId: firstStep ? step.id : s.workflow.startStepId,
        }),
      };
    }),

  removeStep: (id) =>
    set((s) => {
      const layout = { ...(s.workflow.layout ?? {}) };
      delete layout[id];
      const remaining = s.workflow.steps.filter((step) => step.id !== id);
      return {
        selectedStepId: s.selectedStepId === id ? null : s.selectedStepId,
        workflow: touch({
          ...s.workflow,
          steps: remaining.map((step) => ({
            ...step,
            transitions: step.transitions.filter(
              (tr) => !(tr.target.type === "step" && tr.target.stepId === id),
            ),
          })),
          layout,
          startStepId:
            s.workflow.startStepId === id
              ? (remaining[0]?.id ?? null)
              : s.workflow.startStepId,
        }),
      };
    }),

  updateStep: (id, patch) =>
    set((s) => ({ workflow: mapStep(s.workflow, id, (step) => ({ ...step, ...patch })) })),

  setNodePosition: (nodeId, position) =>
    set((s) => ({
      workflow: {
        ...s.workflow,
        layout: { ...(s.workflow.layout ?? {}), [nodeId]: position },
      },
    })),

  setStartStep: (stepId) =>
    set((s) => ({ workflow: touch({ ...s.workflow, startStepId: stepId }) })),

  connectTransition: (sourceStepId, target) =>
    set((s) => ({
      workflow: mapStep(s.workflow, sourceStepId, (step) => ({
        ...step,
        transitions: [...step.transitions, { ...createTransition(), target }],
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
      selectedTransition:
        s.selectedTransition?.transitionId === transitionId
          ? null
          : s.selectedTransition,
      workflow: mapStep(s.workflow, stepId, (step) => ({
        ...step,
        transitions: step.transitions.filter((tr) => tr.id !== transitionId),
      })),
    })),

  selectStep: (id) => set({ selectedStepId: id, selectedTransition: null }),
  selectTransition: (selection) =>
    set({ selectedTransition: selection, selectedStepId: null }),
  clearSelection: () => set({ selectedStepId: null, selectedTransition: null }),

  loadWorkflow: (workflow) =>
    set({
      workflow,
      selectedStepId: null,
      selectedTransition: null,
      stepSeq: workflow.steps.length,
    }),

  resetWorkflow: () =>
    set({
      workflow: createEmptyWorkflow(),
      selectedStepId: null,
      selectedTransition: null,
      stepSeq: 1,
    }),
}));
