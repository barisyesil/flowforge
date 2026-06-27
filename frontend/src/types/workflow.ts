import type { RuleOperator } from "@/types/form";

/**
 * Workflow (süreç) tanımı. Admin tarafından tasarlanır; bir süreç adımlardan
 * oluşur, her adıma bir form ve bir atanan (rol veya kullanıcı) bağlanır,
 * adımlar arası geçişler koşullu olabilir (dinamik dallanma).
 */

/** Bir geçişin koşulu — sürecin o ana kadar toplanmış verisine (alan adı) bakar. */
export type StepCondition = {
  fieldName: string;
  operator: RuleOperator;
  value?: string;
};

/** Geçişin hedefi: başka bir adım ya da sürecin bitişi. */
export type TransitionTarget =
  | { type: "step"; stepId: string }
  | { type: "end"; outcome: "completed" | "rejected" };

/**
 * Bir adımdan çıkış geçişi. `label` çalışma anında butona dönüşür. Aynı label'a
 * sahip birden çok geçiş, koşullarına göre sırayla değerlendirilir (dallanma):
 * ilk koşulu sağlanan (veya koşulsuz) geçişin hedefine gidilir.
 */
export type Transition = {
  id: string;
  label: string;
  condition?: StepCondition;
  target: TransitionTarget;
};

export type WorkflowStep = {
  id: string;
  name: string;
  /** Adıma bağlı form (opsiyonel). */
  formId?: string;
  /** Adımı işleyecek rol. */
  assigneeRole?: string;
  /** Veya belirli kullanıcı (ikisi de desteklenir). */
  assigneeUserId?: string;
  transitions: Transition[];
};

export type WorkflowDefinition = {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  /** Sürecin başlayacağı adım (genelde ilk adım). */
  startStepId: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
};
