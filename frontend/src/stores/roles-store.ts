import { create } from "zustand";

import { rolesApi } from "@/lib/api/roles-api";
import type { RoleDefinition } from "@/types/auth";
import type { RequestStatus } from "@/stores/forms-store";

export type RoleOpResult = "ok" | "taken" | "locked" | "error";

type RolesState = {
  roles: RoleDefinition[];
  status: RequestStatus;

  loadRoles: () => Promise<void>;
  addRole: (name: string) => Promise<RoleOpResult>;
  editRole: (id: string, name: string) => Promise<RoleOpResult>;
  deleteRole: (id: string) => Promise<RoleOpResult>;
};

function mapError(error: unknown): RoleOpResult {
  if (error instanceof Error) {
    if (error.message === "name-taken") return "taken";
    if (error.message === "system-locked") return "locked";
  }
  return "error";
}

export const useRolesStore = create<RolesState>((set) => ({
  roles: [],
  status: "idle",

  loadRoles: async () => {
    set({ status: "loading" });
    try {
      const roles = await rolesApi.list();
      set({ roles, status: "success" });
    } catch {
      set({ status: "error" });
    }
  },

  addRole: async (name) => {
    try {
      const role = await rolesApi.create(name);
      set((s) => ({ roles: [...s.roles, role] }));
      return "ok";
    } catch (error) {
      return mapError(error);
    }
  },

  editRole: async (id, name) => {
    try {
      const updated = await rolesApi.update(id, name);
      set((s) => ({ roles: s.roles.map((r) => (r.id === id ? updated : r)) }));
      return "ok";
    } catch (error) {
      return mapError(error);
    }
  },

  deleteRole: async (id) => {
    try {
      await rolesApi.remove(id);
      set((s) => ({ roles: s.roles.filter((r) => r.id !== id) }));
      return "ok";
    } catch (error) {
      return mapError(error);
    }
  },
}));
