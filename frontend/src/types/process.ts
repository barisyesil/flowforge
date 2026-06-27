import type { FormSubmission } from "@/types/form";

/** Bir sürecin sahip olabileceği durumlar. */
export type ProcessStatus = "pending" | "in_progress" | "completed" | "rejected";

export const processStatusLabels: Record<ProcessStatus, string> = {
  pending: "Beklemede",
  in_progress: "Devam Ediyor",
  completed: "Tamamlandı",
  rejected: "Reddedildi",
};

/** Süreç üzerinde yapılabilecek aksiyonlar. */
export type ProcessAction = "approve" | "complete" | "reject";

export const processActionLabels: Record<ProcessAction, string> = {
  approve: "Onayla",
  complete: "Tamamla",
  reject: "Reddet",
};

/** Süreç geçmişindeki tek bir olay (kim, ne zaman, hangi geçişi yaptı). */
export type ProcessEvent = {
  id: string;
  at: string;
  actorName: string;
  action: ProcessAction | "start";
  fromStatus: ProcessStatus | null;
  toStatus: ProcessStatus;
};

/** Başlatılmış bir süreç örneği. */
export type ProcessInstance = {
  id: string;
  formId: string;
  formName: string;
  formVersion: number;
  /** Süreç başlatılırken girilen form verisi (JSON). */
  data: FormSubmission;
  status: ProcessStatus;
  startedByName: string;
  createdAt: string;
  updatedAt: string;
  history: ProcessEvent[];
};
