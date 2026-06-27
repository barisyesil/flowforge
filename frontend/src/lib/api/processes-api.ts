import { uid } from "@/lib/id";
import { stepById, mergeData, resolveTransition } from "@/lib/workflow-engine";
import type { ProcessInstance, ProcessEvent } from "@/types/process";
import type { WorkflowDefinition } from "@/types/workflow";
import type { FormSubmission } from "@/types/form";

/**
 * Süreç (çalışan workflow örneği) mock API'si. Başlatma ve aksiyon uygulama
 * workflow-engine ile yürütülür; her geçiş loglanır. localStorage tabanlı.
 */

const STORAGE_KEY = "flowforge-processes";
const LATENCY_MS = 400;

function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function normalizeProcess(process: Partial<ProcessInstance>): ProcessInstance {
  const now = new Date().toISOString();
  const workflow: WorkflowDefinition = process.workflow && typeof process.workflow === "object"
    ? {
        ...process.workflow,
        name: process.workflow.name ?? "Untitled workflow",
      }
    : {
        id: process.id ?? uid("wf"),
        name: "Untitled workflow",
        description: "",
        steps: [],
        startStepId: null,
        version: 1,
        createdAt: now,
        updatedAt: now,
      };

  return {
    id: process.id ?? uid("proc"),
    workflow,
    currentStepId: process.currentStepId ?? null,
    status: process.status ?? "in_progress",
    data: process.data ?? {},
    startedByName: process.startedByName ?? "Unknown",
    createdAt: process.createdAt ?? now,
    updatedAt: process.updatedAt ?? now,
    history: Array.isArray(process.history) ? process.history : [],
  };
}

function read(): ProcessInstance[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw.map((process) => normalizeProcess(process as Partial<ProcessInstance>));
  } catch {
    return [];
  }
}

function write(processes: ProcessInstance[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(processes));
}

export const processesApi = {
  async list(): Promise<ProcessInstance[]> {
    return delay(read());
  },

  async get(id: string): Promise<ProcessInstance | undefined> {
    return delay(read().find((p) => p.id === id));
  },

  /** Workflow snapshot'ı ile yeni süreç başlatır; ilk adımı aktif yapar. */
  async start(
    workflow: WorkflowDefinition,
    actorName: string,
  ): Promise<ProcessInstance> {
    const now = new Date().toISOString();
    const startStep = stepById(workflow, workflow.startStepId);
    const process: ProcessInstance = {
      id: uid("proc"),
      workflow,
      currentStepId: workflow.startStepId,
      status: "in_progress",
      data: {},
      startedByName: actorName,
      createdAt: now,
      updatedAt: now,
      history: [
        {
          id: uid("evt"),
          at: now,
          actorName,
          stepName: startStep?.name ?? "—",
          action: "start",
        },
      ],
    };
    const processes = read();
    processes.push(process);
    write(processes);
    return delay(process);
  },

  /**
   * Aktif adıma form verisi + aksiyon uygular; motoru çalıştırıp hedefe ilerler
   * (sonraki adım veya bitiş). Geçersiz aksiyonda hata fırlatır.
   */
  async applyAction(
    processId: string,
    action: string,
    stepData: FormSubmission,
    actorName: string,
  ): Promise<ProcessInstance> {
    const processes = read();
    const index = processes.findIndex((p) => p.id === processId);
    if (index === -1) throw new Error("not-found");

    const process = processes[index];
    if (process.status !== "in_progress" || !process.currentStepId) {
      throw new Error("not-active");
    }
    const step = stepById(process.workflow, process.currentStepId);
    if (!step) throw new Error("step-not-found");

    const newData = { ...process.data, [step.id]: stepData };
    const target = resolveTransition(step, action, mergeData(newData));
    if (!target) throw new Error("no-transition");

    const now = new Date().toISOString();
    let updated: ProcessInstance;

    if (target.type === "end") {
      const event: ProcessEvent = {
        id: uid("evt"),
        at: now,
        actorName,
        stepName: step.name,
        action,
        outcome: target.outcome,
      };
      updated = {
        ...process,
        data: newData,
        status: target.outcome,
        currentStepId: null,
        updatedAt: now,
        history: [...process.history, event],
      };
    } else {
      const nextStep = stepById(process.workflow, target.stepId);
      const event: ProcessEvent = {
        id: uid("evt"),
        at: now,
        actorName,
        stepName: step.name,
        action,
        toStepName: nextStep?.name,
      };
      updated = {
        ...process,
        data: newData,
        currentStepId: target.stepId,
        updatedAt: now,
        history: [...process.history, event],
      };
    }

    processes[index] = updated;
    write(processes);
    return delay(updated);
  },
};
