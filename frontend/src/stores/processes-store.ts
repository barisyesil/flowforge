import { create } from "zustand";

import { processesApi } from "@/lib/api/processes-api";
import type { ProcessInstance, ProcessAction } from "@/types/process";
import type { FormDefinition, FormSubmission } from "@/types/form";
import type { RequestStatus } from "@/stores/forms-store";

type ProcessesState = {
  processes: ProcessInstance[];
  status: RequestStatus;
  error: string | null;

  loadProcesses: () => Promise<void>;
  startProcess: (
    form: FormDefinition,
    data: FormSubmission,
    actorName: string,
  ) => Promise<ProcessInstance | null>;
  runAction: (
    id: string,
    action: ProcessAction,
    actorName: string,
  ) => Promise<ProcessInstance | null>;
};

/** Başlatılmış süreçlerin istemci tarafı durumu. */
export const useProcessesStore = create<ProcessesState>((set) => ({
  processes: [],
  status: "idle",
  error: null,

  loadProcesses: async () => {
    set({ status: "loading", error: null });
    try {
      const processes = await processesApi.list();
      set({ processes, status: "success" });
    } catch {
      set({ status: "error", error: "Süreçler yüklenemedi." });
    }
  },

  startProcess: async (form, data, actorName) => {
    try {
      const created = await processesApi.start(form, data, actorName);
      set((s) => ({ processes: [...s.processes, created] }));
      return created;
    } catch {
      set({ error: "Süreç başlatılamadı." });
      return null;
    }
  },

  runAction: async (id, action, actorName) => {
    try {
      const updated = await processesApi.applyAction(id, action, actorName);
      set((s) => ({
        processes: s.processes.map((p) => (p.id === id ? updated : p)),
      }));
      return updated;
    } catch {
      set({ error: "Aksiyon uygulanamadı." });
      return null;
    }
  },
}));
