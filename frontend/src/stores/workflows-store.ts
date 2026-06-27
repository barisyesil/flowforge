import { create } from "zustand";

import { workflowsApi } from "@/lib/api/workflows-api";
import type { WorkflowDefinition } from "@/types/workflow";
import type { RequestStatus } from "@/stores/forms-store";

type WorkflowsState = {
  workflows: WorkflowDefinition[];
  status: RequestStatus;

  loadWorkflows: () => Promise<void>;
  saveWorkflow: (
    definition: WorkflowDefinition,
  ) => Promise<WorkflowDefinition | null>;
};

export const useWorkflowsStore = create<WorkflowsState>((set) => ({
  workflows: [],
  status: "idle",

  loadWorkflows: async () => {
    set({ status: "loading" });
    try {
      const workflows = await workflowsApi.list();
      set({ workflows, status: "success" });
    } catch {
      set({ status: "error" });
    }
  },

  saveWorkflow: async (definition) => {
    try {
      const saved = await workflowsApi.save(definition);
      set((s) => {
        const index = s.workflows.findIndex((w) => w.id === saved.id);
        const workflows =
          index === -1
            ? [...s.workflows, saved]
            : s.workflows.map((w) => (w.id === saved.id ? saved : w));
        return { workflows };
      });
      return saved;
    } catch {
      return null;
    }
  },
}));
