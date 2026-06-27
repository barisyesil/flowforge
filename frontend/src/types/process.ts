import type { FormSubmission } from "@/types/form";
import type { WorkflowDefinition } from "@/types/workflow";

/** Çalışan bir sürecin durumu. */
export type ProcessStatus = "in_progress" | "completed" | "rejected";

/** Süreç geçmişindeki bir olay (kim, ne zaman, hangi adımda, hangi aksiyon). */
export type ProcessEvent = {
  id: string;
  at: string;
  actorName: string;
  /** Olayın gerçekleştiği adım adı. */
  stepName: string;
  /** "start" veya seçilen geçiş (aksiyon) etiketi. */
  action: string;
  /** Bir sonraki adımın adı (varsa). */
  toStepName?: string;
  /** Süreç bittiyse sonuç. */
  outcome?: "completed" | "rejected";
};

/** Bir workflow'dan başlatılmış, adımlar arasında ilerleyen süreç örneği. */
export type ProcessInstance = {
  id: string;
  /** Başlatıldığı andaki workflow snapshot'ı (sürüm-kararlı yürütme). */
  workflow: WorkflowDefinition;
  /** Aktif adım; null ise süreç bitmiştir. */
  currentStepId: string | null;
  status: ProcessStatus;
  /** Adım bazında toplanan form verisi (stepId -> submission). */
  data: Record<string, FormSubmission>;
  startedByName: string;
  createdAt: string;
  updatedAt: string;
  history: ProcessEvent[];
};
