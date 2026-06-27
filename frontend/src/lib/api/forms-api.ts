import type { FormDefinition } from "@/types/form";

/**
 * Mock API — gerçek bir backend varmış gibi davranır (gecikmeli Promise döner,
 * veriyi localStorage'da saklar). Gerçek .NET backend bağlandığında bu dosyadaki
 * fonksiyonlar fetch çağrılarıyla değiştirilecek; arayüz (imza) aynı kalacak.
 */

const STORAGE_KEY = "flowforge-forms";
const LATENCY_MS = 400;

function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function read(): FormDefinition[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function write(forms: FormDefinition[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
}

export const formsApi = {
  /** Tüm kayıtlı form tanımlarını döner. */
  async list(): Promise<FormDefinition[]> {
    return delay(read());
  },

  /** Tek bir form tanımını id ile döner. */
  async get(id: string): Promise<FormDefinition | undefined> {
    return delay(read().find((f) => f.id === id));
  },

  /** Formu oluşturur veya günceller; güncellemede sürümü artırır. */
  async save(definition: FormDefinition): Promise<FormDefinition> {
    const forms = read();
    const index = forms.findIndex((f) => f.id === definition.id);
    const saved: FormDefinition = {
      ...definition,
      updatedAt: new Date().toISOString(),
      version: index === -1 ? definition.version : definition.version + 1,
    };
    if (index === -1) {
      forms.push(saved);
    } else {
      forms[index] = saved;
    }
    write(forms);
    return delay(saved);
  },
};
