import type { User, Role } from "@/types/auth";

type SeedUser = User & { password: string };

/**
 * Demo kullanıcıları. Backend authentication bağlanana kadar login bu listeye
 * karşı doğrulanır. Şifreler yalnızca mock amaçlıdır; gerçek auth backend'e geçince
 * bu dosya kaldırılacaktır.
 */
const seedUsers: SeedUser[] = [
  {
    id: "u-admin",
    username: "admin",
    password: "admin123",
    displayName: "Barış Yeşildağ",
    role: "admin",
  },
  {
    id: "u-approver",
    username: "onayci",
    password: "onayci123",
    displayName: "Ayşe Onay",
    role: "approver",
  },
  {
    id: "u-user",
    username: "kullanici",
    password: "kullanici123",
    displayName: "Mehmet Kullanıcı",
    role: "user",
  },
];

/** Login ekranında ipucu olarak gösterilecek demo bilgileri. */
export const demoCredentials: { username: string; password: string; role: Role }[] =
  seedUsers.map((u) => ({ username: u.username, password: u.password, role: u.role }));

/** Kimlik doğrular; başarılıysa şifresiz User döner, değilse null. */
export function authenticate(username: string, password: string): User | null {
  const match = seedUsers.find(
    (u) => u.username === username && u.password === password,
  );
  if (!match) return null;
  const { password: _password, ...user } = match;
  return user;
}
