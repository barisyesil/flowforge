import { uid } from "@/lib/id";
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
    version: 1,
    createdAt: now,
    updatedAt: now,
  };
}
