import { uid } from "@/lib/id";
import {
  START_NODE_ID,
  END_COMPLETED_ID,
  END_REJECTED_ID,
} from "@/lib/workflow-graph";
import type {
  WorkflowDefinition,
  WorkflowStep,
  Transition,
} from "@/types/workflow";

/** Varsayılan onay/red geçişleri üretir (sonraki adım sonradan bağlanır). */
export function defaultTransitions(): Transition[] {
  return [
    {
      id: uid("tr"),
      label: "Onayla",
      target: { type: "end", outcome: "completed" },
    },
    {
      id: uid("tr"),
      label: "Reddet",
      target: { type: "end", outcome: "rejected" },
    },
  ];
}

export function createStep(index: number): WorkflowStep {
  return {
    id: uid("step"),
    name: `Adım ${index}`,
    transitions: defaultTransitions(),
  };
}

export function createTransition(): Transition {
  return {
    id: uid("tr"),
    label: "Onayla",
    target: { type: "end", outcome: "completed" },
  };
}

export function createEmptyWorkflow(): WorkflowDefinition {
  const now = new Date().toISOString();
  const firstStep = createStep(1);
  return {
    id: uid("wf"),
    name: "Yeni Süreç",
    description: "",
    steps: [firstStep],
    startStepId: firstStep.id,
    layout: {
      [START_NODE_ID]: { x: 40, y: 200 },
      [firstStep.id]: { x: 320, y: 190 },
      [END_COMPLETED_ID]: { x: 660, y: 110 },
      [END_REJECTED_ID]: { x: 660, y: 300 },
    },
    version: 1,
    createdAt: now,
    updatedAt: now,
  };
}
