import { create } from "zustand";

import { processesApi } from "@/lib/api/processes-api";
import type { ProcessInstance } from "@/types/process";
import type { WorkflowDefinition } from "@/types/workflow";
import type { FormSubmission } from "@/types/form";
import type { RequestStatus } from "@/stores/forms-store";

type ProcessesState = {
  processes: ProcessInstance[];
  status: RequestStatus;

  loadProcesses: () => Promise<void>;
  startProcess: (
    workflow: WorkflowDefinition,
    actorName: string,
  ) => Promise<ProcessInstance | null>;
  applyAction: (
    processId: string,
    action: string,
    stepData: FormSubmission,
    actorName: string,
  ) => Promise<ProcessInstance | null>;
};

export const useProcessesStore = create<ProcessesState>((set) => ({
  processes: [],
  status: "idle",

  loadProcesses: async () => {
    set({ status: "loading" });
    try {
      const processes = await processesApi.list();
      set({ processes, status: "success" });
    } catch {
      set({ status: "error" });
    }
  },

  startProcess: async (workflow, actorName) => {
    try {
      const created = await processesApi.start(workflow, actorName);
      set((s) => ({ processes: [...s.processes, created] }));
      return created;
    } catch {
      return null;
    }
  },

  applyAction: async (processId, action, stepData, actorName) => {
    try {
      const updated = await processesApi.applyAction(
        processId,
        action,
        stepData,
        actorName,
      );
      set((s) => ({
        processes: s.processes.map((p) => (p.id === processId ? updated : p)),
      }));
      return updated;
    } catch {
      return null;
    }
  },
}));
