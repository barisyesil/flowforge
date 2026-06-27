import type { RoleDefinition } from "@/types/auth";
import type { TranslationKey } from "@/lib/i18n/dictionaries";

/** Rezerve sistem rolleri. "admin" erişim kontrolü için özeldir. */
export const SYSTEM_ROLE_IDS = ["admin", "approver", "user"] as const;

export function isSystemRole(roleId: string): boolean {
  return (SYSTEM_ROLE_IDS as readonly string[]).includes(roleId);
}

/**
 * Bir rol id'sini görünür etikete çevirir.
 * Sistem rolü ise i18n anahtarından (role.admin gibi), değilse rol tanımının
 * adından; bulunamazsa id'nin kendisinden.
 */
export function roleLabel(
  roleId: string,
  roles: RoleDefinition[],
  t: (key: TranslationKey) => string,
): string {
  if (isSystemRole(roleId)) {
    return t(`role.${roleId}` as TranslationKey);
  }
  return roles.find((r) => r.id === roleId)?.name ?? roleId;
}
