/** Kısa, okunabilir, çakışması pratikte imkânsız kimlik üretir (ör. "fld_k3n9x2a"). */
export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
