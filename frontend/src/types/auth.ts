/**
 * Rol kimliği. Dinamik roller desteklenir: sistem rolleri ("admin", "approver",
 * "user") rezervedir, admin yeni roller (ör. "Yönetici", "Muhasebe") ekleyebilir.
 * "admin" erişim kontrolü için özel rol olarak kalır.
 */
export type Role = string;

export type User = {
  id: string;
  username: string;
  displayName: string;
  role: Role;
};

/** Admin tarafından yönetilen rol tanımı. */
export type RoleDefinition = {
  id: string;
  name: string;
  /** Sistem rolü mü? (silinemez, etiketi i18n'den gelir) */
  isSystem: boolean;
};
