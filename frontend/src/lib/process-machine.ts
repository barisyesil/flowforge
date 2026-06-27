import type { ProcessStatus, ProcessAction } from "@/types/process";
import type { Role } from "@/types/auth";

/**
 * Statik durum geçiş tablosu (state machine).
 *
 *   Beklemede   --onayla-->  Devam Ediyor   --tamamla-->  Tamamlandı
 *       |  \--reddet--> Reddedildi              |
 *       |                                       \--reddet--> Reddedildi
 *
 * Tamamlandı ve Reddedildi son (terminal) durumlardır.
 * Bu yapı, backend'e taşındığında birebir aynı geçişlerle çalışacak.
 */
const TRANSITIONS: Record<
  ProcessStatus,
  Partial<Record<ProcessAction, ProcessStatus>>
> = {
  pending: { approve: "in_progress", reject: "rejected" },
  in_progress: { complete: "completed", reject: "rejected" },
  completed: {},
  rejected: {},
};

/** Verilen durumda yapılabilecek aksiyonlar. */
export function availableActions(status: ProcessStatus): ProcessAction[] {
  return Object.keys(TRANSITIONS[status]) as ProcessAction[];
}

/** Aksiyon sonrası varılacak durum (geçerli değilse null). */
export function nextStatus(
  status: ProcessStatus,
  action: ProcessAction,
): ProcessStatus | null {
  return TRANSITIONS[status][action] ?? null;
}

/** Durum son (terminal) mu? */
export function isTerminal(status: ProcessStatus): boolean {
  return availableActions(status).length === 0;
}

/**
 * Yetkilendirme: hangi rol hangi aksiyonu yapabilir?
 * Onay/red/tamamla yalnızca admin ve onaycı içindir; normal kullanıcı
 * yalnızca süreç başlatabilir.
 */
const ACTION_ROLES: Record<ProcessAction, Role[]> = {
  approve: ["admin", "approver"],
  complete: ["admin", "approver"],
  reject: ["admin", "approver"],
};

export function canRoleAct(role: Role, action: ProcessAction): boolean {
  return ACTION_ROLES[action].includes(role);
}
