import { create } from "zustand";

import { formsApi } from "@/lib/api/forms-api";
import type { FormDefinition } from "@/types/form";

export type RequestStatus = "idle" | "loading" | "success" | "error";

type FormsState = {
  forms: FormDefinition[];
  status: RequestStatus;
  error: string | null;

  /** Kayıtlı formları mock API'den yükler. */
  loadForms: () => Promise<void>;
  /** Form tanımını kaydeder ve listeyi günceller. */
  saveForm: (definition: FormDefinition) => Promise<FormDefinition | null>;
};

/** Kayıtlı form tanımlarının (backend'te saklanacak verinin) istemci tarafı durumu. */
export const useFormsStore = create<FormsState>((set) => ({
  forms: [],
  status: "idle",
  error: null,

  loadForms: async () => {
    set({ status: "loading", error: null });
    try {
      const forms = await formsApi.list();
      set({ forms, status: "success" });
    } catch {
      set({ status: "error", error: "Formlar yüklenemedi." });
    }
  },

  saveForm: async (definition) => {
    set({ status: "loading", error: null });
    try {
      const saved = await formsApi.save(definition);
      set((s) => {
        const index = s.forms.findIndex((f) => f.id === saved.id);
        const forms =
          index === -1
            ? [...s.forms, saved]
            : s.forms.map((f) => (f.id === saved.id ? saved : f));
        return { forms, status: "success" };
      });
      return saved;
    } catch {
      set({ status: "error", error: "Form kaydedilemedi." });
      return null;
    }
  },
}));
