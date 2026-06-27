import { create } from "zustand";

import { usersApi, type NewUserInput } from "@/lib/api/users-api";
import type { User } from "@/types/auth";
import type { RequestStatus } from "@/stores/forms-store";

/** İşlem sonucu: başarı / kullanıcı adı çakışması / genel hata. */
export type UserOpResult = "ok" | "taken" | "error";

type UsersState = {
  users: User[];
  status: RequestStatus;

  loadUsers: () => Promise<void>;
  addUser: (input: NewUserInput) => Promise<UserOpResult>;
  editUser: (id: string, patch: Partial<NewUserInput>) => Promise<UserOpResult>;
  deleteUser: (id: string) => Promise<boolean>;
};

function mapError(error: unknown): UserOpResult {
  return error instanceof Error && error.message === "username-taken"
    ? "taken"
    : "error";
}

export const useUsersStore = create<UsersState>((set) => ({
  users: [],
  status: "idle",

  loadUsers: async () => {
    set({ status: "loading" });
    try {
      const users = await usersApi.list();
      set({ users, status: "success" });
    } catch {
      set({ status: "error" });
    }
  },

  addUser: async (input) => {
    try {
      const user = await usersApi.create(input);
      set((s) => ({ users: [...s.users, user] }));
      return "ok";
    } catch (error) {
      return mapError(error);
    }
  },

  editUser: async (id, patch) => {
    try {
      const updated = await usersApi.update(id, patch);
      set((s) => ({
        users: s.users.map((u) => (u.id === id ? updated : u)),
      }));
      return "ok";
    } catch (error) {
      return mapError(error);
    }
  },

  deleteUser: async (id) => {
    try {
      await usersApi.remove(id);
      set((s) => ({ users: s.users.filter((u) => u.id !== id) }));
      return true;
    } catch {
      return false;
    }
  },
}));
