import { uid } from "@/lib/id";
import type { User, Role } from "@/types/auth";

/** Şifreyi de içeren depolama kaydı (mock; gerçek backend'de şifre asla istemciye gelmez). */
export type UserRecord = User & { password: string };

export type NewUserInput = {
  username: string;
  displayName: string;
  password: string;
  role: Role;
};

const STORAGE_KEY = "flowforge-users";
const LATENCY_MS = 350;

/** İlk açılışta yüklenecek demo kullanıcıları. */
const SEED_USERS: UserRecord[] = [
  { id: "u-admin", username: "admin", password: "admin123", displayName: "Barış Yeşildağ", role: "admin" },
  { id: "u-approver", username: "onayci", password: "onayci123", displayName: "Ayşe Onay", role: "approver" },
  { id: "u-user", username: "kullanici", password: "kullanici123", displayName: "Mehmet Kullanıcı", role: "user" },
];

function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/** Depolamadan okur; boşsa seed ile doldurur. */
function readRaw(): UserRecord[] {
  if (typeof window === "undefined") return SEED_USERS;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_USERS));
    return SEED_USERS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return SEED_USERS;
  }
}

function write(users: UserRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

/** Şifreyi çıkararak güvenli User döner. */
function strip(record: UserRecord): User {
  const { password: _password, ...user } = record;
  return user;
}

/** Login ekranında ipucu olarak gösterilecek demo bilgileri (seed'den). */
export const demoCredentials: { username: string; password: string; role: Role }[] =
  SEED_USERS.map((u) => ({ username: u.username, password: u.password, role: u.role }));

/** Kimlik doğrular; başarılıysa şifresiz User döner, değilse null. */
export function authenticate(username: string, password: string): User | null {
  const match = readRaw().find(
    (u) => u.username === username && u.password === password,
  );
  return match ? strip(match) : null;
}

export const usersApi = {
  async list(): Promise<User[]> {
    return delay(readRaw().map(strip));
  },

  /** Yeni kullanıcı ekler; kullanıcı adı çakışırsa hata fırlatır. */
  async create(input: NewUserInput): Promise<User> {
    const users = readRaw();
    if (users.some((u) => u.username === input.username)) {
      throw new Error("username-taken");
    }
    const record: UserRecord = { id: uid("u"), ...input };
    users.push(record);
    write(users);
    return delay(strip(record));
  },

  /** Kullanıcıyı günceller (şifre boşsa korunur); kullanıcı adı çakışırsa hata fırlatır. */
  async update(
    id: string,
    patch: Partial<NewUserInput>,
  ): Promise<User> {
    const users = readRaw();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error("not-found");
    if (
      patch.username &&
      users.some((u) => u.username === patch.username && u.id !== id)
    ) {
      throw new Error("username-taken");
    }
    const current = users[index];
    const updated: UserRecord = {
      ...current,
      ...patch,
      password: patch.password ? patch.password : current.password,
    };
    users[index] = updated;
    write(users);
    return delay(strip(updated));
  },

  async remove(id: string): Promise<void> {
    write(readRaw().filter((u) => u.id !== id));
    return delay(undefined);
  },
};
