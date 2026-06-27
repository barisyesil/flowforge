/** Sistemdeki roller. Her kullanıcı tek bir role sahiptir (doküman gereği). */
export type Role = "admin" | "approver" | "user";

export type User = {
  id: string;
  username: string;
  displayName: string;
  role: Role;
};

/** Rollerin arayüzde gösterilecek Türkçe etiketleri. */
export const roleLabels: Record<Role, string> = {
  admin: "Admin",
  approver: "Onaycı",
  user: "Kullanıcı",
};
