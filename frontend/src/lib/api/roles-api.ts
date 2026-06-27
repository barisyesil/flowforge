import { uid } from "@/lib/id";
import type { RoleDefinition } from "@/types/auth";

/**
 * Roller mock API'si (localStorage). Sistem rolleri silinemez/yeniden
 * adlandırılamaz; admin ek şirket rolleri tanımlayabilir.
 */

const STORAGE_KEY = "flowforge-roles";
const LATENCY_MS = 300;

const SEED_ROLES: RoleDefinition[] = [
  { id: "admin", name: "Admin", isSystem: true },
  { id: "approver", name: "Onaycı", isSystem: true },
  { id: "user", name: "Kullanıcı", isSystem: true },
  { id: "manager", name: "Yönetici", isSystem: false },
  { id: "hr", name: "İK", isSystem: false },
  { id: "finance", name: "Muhasebe", isSystem: false },
  { id: "employee", name: "Çalışan", isSystem: false },
];

function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function readRaw(): RoleDefinition[] {
  if (typeof window === "undefined") return SEED_ROLES;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ROLES));
    return SEED_ROLES;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return SEED_ROLES;
  }
}

function write(roles: RoleDefinition[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(roles));
}

export const rolesApi = {
  async list(): Promise<RoleDefinition[]> {
    return delay(readRaw());
  },

  async create(name: string): Promise<RoleDefinition> {
    const roles = readRaw();
    const trimmed = name.trim();
    if (roles.some((r) => r.name.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error("name-taken");
    }
    const role: RoleDefinition = { id: uid("role"), name: trimmed, isSystem: false };
    roles.push(role);
    write(roles);
    return delay(role);
  },

  async update(id: string, name: string): Promise<RoleDefinition> {
    const roles = readRaw();
    const index = roles.findIndex((r) => r.id === id);
    if (index === -1) throw new Error("not-found");
    if (roles[index].isSystem) throw new Error("system-locked");
    const trimmed = name.trim();
    if (
      roles.some(
        (r) => r.id !== id && r.name.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      throw new Error("name-taken");
    }
    const updated: RoleDefinition = { ...roles[index], name: trimmed };
    roles[index] = updated;
    write(roles);
    return delay(updated);
  },

  async remove(id: string): Promise<void> {
    const roles = readRaw();
    const role = roles.find((r) => r.id === id);
    if (role?.isSystem) throw new Error("system-locked");
    write(roles.filter((r) => r.id !== id));
    return delay(undefined);
  },
};
