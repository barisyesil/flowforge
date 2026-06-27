import type { WorkflowDefinition } from "@/types/workflow";

/** Workflow (süreç) tanımları için mock API (localStorage). forms-api ile aynı desen. */

const STORAGE_KEY = "flowforge-workflows";
const LATENCY_MS = 400;

function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function read(): WorkflowDefinition[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function write(workflows: WorkflowDefinition[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
}

export const workflowsApi = {
  async list(): Promise<WorkflowDefinition[]> {
    return delay(read());
  },

  async get(id: string): Promise<WorkflowDefinition | undefined> {
    return delay(read().find((w) => w.id === id));
  },

  async save(definition: WorkflowDefinition): Promise<WorkflowDefinition> {
    const workflows = read();
    const index = workflows.findIndex((w) => w.id === definition.id);
    const saved: WorkflowDefinition = {
      ...definition,
      updatedAt: new Date().toISOString(),
      version: index === -1 ? definition.version : definition.version + 1,
    };
    if (index === -1) workflows.push(saved);
    else workflows[index] = saved;
    write(workflows);
    return delay(saved);
  },
};
