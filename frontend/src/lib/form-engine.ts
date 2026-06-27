import type {
  FormDefinition,
  FormField,
  FormSubmission,
  FieldValue,
  RuleCondition,
} from "@/types/form";

/** Alan adı (name) -> hata mesajı. */
export type FieldErrors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmpty(value: FieldValue | undefined): boolean {
  return (
    value === null ||
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

/** Bir kural koşulunun mevcut değerlere göre sağlanıp sağlanmadığı. */
function conditionMet(
  condition: RuleCondition,
  fields: FormField[],
  values: FormSubmission,
): boolean {
  const field = fields.find((f) => f.id === condition.fieldId);
  if (!field) return false;
  const v = values[field.name];

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

export type FormEvaluation = {
  /** Kurallar nedeniyle gizlenen alanlar. */
  hiddenFieldIds: Set<string>;
  /** Temel + kurallarla zorunlu hale gelen alanlar. */
  requiredFieldIds: Set<string>;
};

/**
 * Kuralları değerlendirir: her alanın o anki görünürlük ve zorunluluk durumunu
 * hesaplar. Bağımlı validasyon ve koşullu görünürlük burada birleşir.
 */
export function evaluateForm(
  form: FormDefinition,
  values: FormSubmission,
): FormEvaluation {
  const hiddenFieldIds = new Set<string>();
  const requiredFieldIds = new Set<string>();

  for (const field of form.fields) {
    if (field.required) requiredFieldIds.add(field.id);
  }

  for (const rule of form.rules) {
    const met = conditionMet(rule.when, form.fields, values);
    if (rule.action === "require" && met) requiredFieldIds.add(rule.targetFieldId);
    // "hide": koşul sağlanınca gizle. "show": koşul sağlanmadıkça gizli.
    if (rule.action === "hide" && met) hiddenFieldIds.add(rule.targetFieldId);
    if (rule.action === "show" && !met) hiddenFieldIds.add(rule.targetFieldId);
  }

  return { hiddenFieldIds, requiredFieldIds };
}

/** Tüm görünür alanları doğrular; hata haritası döner (boşsa geçerli). */
export function validateForm(
  form: FormDefinition,
  values: FormSubmission,
): FieldErrors {
  const { hiddenFieldIds, requiredFieldIds } = evaluateForm(form, values);
  const errors: FieldErrors = {};

  for (const field of form.fields) {
    if (hiddenFieldIds.has(field.id)) continue;

    const v = values[field.name];
    const required = requiredFieldIds.has(field.id);

    // Onay kutusu: zorunluysa işaretlenmeli.
    if (field.type === "checkbox") {
      if (required && v !== true) errors[field.name] = "Bu alanı işaretlemelisiniz.";
      continue;
    }

    if (isEmpty(v)) {
      if (required) errors[field.name] = "Bu alan zorunludur.";
      continue;
    }

    const text = String(v);
    const rules = field.validation ?? {};

    if (field.type === "number") {
      const n = Number(v);
      if (Number.isNaN(n)) {
        errors[field.name] = "Geçerli bir sayı girin.";
      } else if (rules.min !== undefined && n < rules.min) {
        errors[field.name] = `En az ${rules.min} olmalı.`;
      } else if (rules.max !== undefined && n > rules.max) {
        errors[field.name] = `En fazla ${rules.max} olmalı.`;
      }
      continue;
    }

    if (field.type === "email" && !EMAIL_RE.test(text)) {
      errors[field.name] = "Geçerli bir e-posta adresi girin.";
      continue;
    }

    if (field.type === "text" || field.type === "textarea" || field.type === "email") {
      if (rules.minLength !== undefined && text.length < rules.minLength) {
        errors[field.name] = `En az ${rules.minLength} karakter girin.`;
      } else if (rules.maxLength !== undefined && text.length > rules.maxLength) {
        errors[field.name] = `En fazla ${rules.maxLength} karakter girin.`;
      } else if (rules.pattern) {
        try {
          if (!new RegExp(rules.pattern).test(text)) {
            errors[field.name] = "Girdiğiniz değer beklenen biçimde değil.";
          }
        } catch {
          /* geçersiz regex deseni yok sayılır */
        }
      }
    }
  }

  return errors;
}

/**
 * Gönderim için tipli JSON üretir: sayılar number'a çevrilir, onay kutuları
 * boolean olur, gizli alanlar atlanır. (Adım 3'te gösterilecek çıktı.)
 */
export function buildSubmission(
  form: FormDefinition,
  values: FormSubmission,
): FormSubmission {
  const { hiddenFieldIds } = evaluateForm(form, values);
  const output: FormSubmission = {};

  for (const field of form.fields) {
    if (hiddenFieldIds.has(field.id)) continue;
    const v = values[field.name];

    if (field.type === "number") {
      output[field.name] = isEmpty(v) ? null : Number(v);
    } else if (field.type === "checkbox") {
      output[field.name] = v === true;
    } else {
      output[field.name] = v ?? null;
    }
  }

  return output;
}
