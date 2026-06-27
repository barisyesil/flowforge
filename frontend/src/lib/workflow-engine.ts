import { isEmpty } from "@/lib/form-engine";
import type { FormSubmission } from "@/types/form";
import type {
  WorkflowDefinition,
  WorkflowStep,
  StepCondition,
  TransitionTarget,
} from "@/types/workflow";
import type { User } from "@/types/auth";

/** Workflow'da id ile adım bulur. */
export function stepById(
  workflow: WorkflowDefinition,
  stepId: string | null,
): WorkflowStep | undefined {
  if (!stepId) return undefined;
  return workflow.steps.find((s) => s.id === stepId);
}

/** Adımlara göre toplanmış veriyi alan adına göre tek bir nesnede birleştirir. */
export function mergeData(
  dataByStep: Record<string, FormSubmission>,
): FormSubmission {
  const merged: FormSubmission = {};
  for (const submission of Object.values(dataByStep)) {
    Object.assign(merged, submission);
  }
  return merged;
}

/** Bir geçiş koşulunu birleşik veriye göre değerlendirir. */
function evalCondition(condition: StepCondition, data: FormSubmission): boolean {
  const v = data[condition.fieldName];
  switch (condition.operator) {
    case "isChecked":
      return v === true;
    case "isNotEmpty":
      return !isEmpty(v);
    case "equals":
      return String(v ?? "") === String(condition.value ?? "");
    case "notEquals":
      return String(v ?? "") !== String(condition.value ?? "");
    case "in":
      return Array.isArray(condition.value)
        ? condition.value.includes(String(v ?? ""))
        : false;
    default:
      return false;
  }
}

/** Adımdaki benzersiz aksiyon (buton) etiketleri. */
export function actionLabels(step: WorkflowStep): string[] {
  return [...new Set(step.transitions.map((tr) => tr.label))];
}

/**
 * Seçilen aksiyon için hedefi çözer: aynı etiketli geçişler sırayla denenir,
 * ilk koşulu sağlanan (veya koşulsuz) geçişin hedefi döner (koşullu dallanma).
 */
export function resolveTransition(
  step: WorkflowStep,
  actionLabel: string,
  data: FormSubmission,
): TransitionTarget | null {
  const candidates = step.transitions.filter((tr) => tr.label === actionLabel);
  for (const tr of candidates) {
    if (!tr.condition || evalCondition(tr.condition, data)) {
      return tr.target;
    }
  }
  return null;
}

/**
 * Kullanıcı bu adımda işlem yapabilir mi? (admin her zaman; atanan rol/kullanıcı;
 * atanmamış adımda herkes.)
 */
export function canActOnStep(step: WorkflowStep, user: User): boolean {
  if (user.role === "admin") return true;
  if (step.assigneeUserId) return step.assigneeUserId === user.id;
  if (step.assigneeRole) return step.assigneeRole === user.role;
  return true;
}

/** Bu adım kullanıcının "İşlerim" gelen kutusuna düşer mi? (admin override yok) */
export function isMyTask(step: WorkflowStep, user: User): boolean {
  if (step.assigneeUserId) return step.assigneeUserId === user.id;
  if (step.assigneeRole) return step.assigneeRole === user.role;
  return false;
}
