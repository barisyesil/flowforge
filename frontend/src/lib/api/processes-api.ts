import { uid } from "@/lib/id";
import { nextStatus } from "@/lib/process-machine";
import type {
  ProcessInstance,
  ProcessAction,
  ProcessEvent,
} from "@/types/process";
import type { FormDefinition, FormSubmission } from "@/types/form";

/**
 * Mock süreç API'si — gerçek backend varmış gibi davranır. State machine
 * geçişleri ve geçmiş (log) burada yönetilir; backend bağlanınca bu dosya
 * fetch çağrılarıyla değiştirilecek.
 */

const STORAGE_KEY = "flowforge-processes";
const LATENCY_MS = 400;

function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function read(): ProcessInstance[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
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

  /** Yeni süreç başlatır: ilk durum "Beklemede" ve bir "start" olayı eklenir. */
  async start(
    form: FormDefinition,
    data: FormSubmission,
    actorName: string,
  ): Promise<ProcessInstance> {
    const now = new Date().toISOString();
    const startEvent: ProcessEvent = {
      id: uid("evt"),
      at: now,
      actorName,
      action: "start",
      fromStatus: null,
      toStatus: "pending",
    };
    const process: ProcessInstance = {
      id: uid("proc"),
      formId: form.id,
      formName: form.name,
      formVersion: form.version,
      data,
      status: "pending",
      startedByName: actorName,
      createdAt: now,
      updatedAt: now,
      history: [startEvent],
    };
    const processes = read();
    processes.push(process);
    write(processes);
    return delay(process);
  },

  /** Sürece bir aksiyon uygular; geçiş geçersizse hata fırlatır. */
  async applyAction(
    id: string,
    action: ProcessAction,
    actorName: string,
  ): Promise<ProcessInstance> {
    const processes = read();
    const index = processes.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Süreç bulunamadı.");

    const process = processes[index];
    const to = nextStatus(process.status, action);
    if (!to) throw new Error("Bu durumda bu aksiyon uygulanamaz.");

    const now = new Date().toISOString();
    const event: ProcessEvent = {
      id: uid("evt"),
      at: now,
      actorName,
      action,
      fromStatus: process.status,
      toStatus: to,
    };
    const updated: ProcessInstance = {
      ...process,
      status: to,
      updatedAt: now,
      history: [...process.history, event],
    };
    processes[index] = updated;
    write(processes);
    return delay(updated);
  },
};
