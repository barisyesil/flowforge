import { create } from "zustand";

import { uid } from "@/lib/id";
import { createField, createOption, createEmptyForm } from "@/lib/form-factory";
import type {
  FieldType,
  FormField,
  FieldOption,
  FormRule,
  FormDefinition,
} from "@/types/form";

type FormBuilderState = {
  form: FormDefinition;
  selectedFieldId: string | null;
  /** Benzersiz alan adı üretmek için artan sayaç (silme sonrası çakışmayı önler). */
  fieldSeq: number;

  // Form meta
  setName: (name: string) => void;
  setDescription: (description: string) => void;

  // Alanlar
  addField: (type: FieldType) => void;
  removeField: (id: string) => void;
  updateField: (id: string, patch: Partial<FormField>) => void;
  selectField: (id: string | null) => void;
  moveField: (id: string, direction: "up" | "down") => void;

  // Seçenekler (select / radio)
  addOption: (fieldId: string) => void;
  updateOption: (fieldId: string, optionId: string, patch: Partial<FieldOption>) => void;
  removeOption: (fieldId: string, optionId: string) => void;

  // Kurallar (bağımlı validasyon / koşullu görünürlük)
  addRule: () => void;
  updateRule: (id: string, patch: Partial<FormRule>) => void;
  removeRule: (id: string) => void;

  resetForm: () => void;
};

/** updatedAt'i güncel tutan küçük yardımcı. */
function touch(form: FormDefinition): FormDefinition {
  return { ...form, updatedAt: new Date().toISOString() };
}

/** Bir alanı id'sine göre güncelleyip yeni form döndürür. */
function mapField(
  form: FormDefinition,
  id: string,
  fn: (field: FormField) => FormField,
): FormDefinition {
  return touch({
    ...form,
    fields: form.fields.map((f) => (f.id === id ? fn(f) : f)),
  });
}

export const useFormBuilderStore = create<FormBuilderState>((set) => ({
  form: createEmptyForm(),
  selectedFieldId: null,
  fieldSeq: 0,

  setName: (name) => set((s) => ({ form: touch({ ...s.form, name }) })),
  setDescription: (description) =>
    set((s) => ({ form: touch({ ...s.form, description }) })),

  addField: (type) =>
    set((s) => {
      const index = s.fieldSeq + 1;
      const field = createField(type, index);
      return {
        fieldSeq: index,
        selectedFieldId: field.id,
        form: touch({ ...s.form, fields: [...s.form.fields, field] }),
      };
    }),

  removeField: (id) =>
    set((s) => ({
      selectedFieldId: s.selectedFieldId === id ? null : s.selectedFieldId,
      form: touch({
        ...s.form,
        fields: s.form.fields.filter((f) => f.id !== id),
        // Silinen alanı hedef alan ya da koşul alan olarak kullanan kuralları da temizle.
        rules: s.form.rules.filter(
          (r) => r.targetFieldId !== id && r.when.fieldId !== id,
        ),
      }),
    })),

  updateField: (id, patch) =>
    set((s) => ({ form: mapField(s.form, id, (f) => ({ ...f, ...patch })) })),

  selectField: (id) => set({ selectedFieldId: id }),

  moveField: (id, direction) =>
    set((s) => {
      const fields = [...s.form.fields];
      const i = fields.findIndex((f) => f.id === id);
      if (i === -1) return s;
      const j = direction === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= fields.length) return s;
      [fields[i], fields[j]] = [fields[j], fields[i]];
      return { form: touch({ ...s.form, fields }) };
    }),

  addOption: (fieldId) =>
    set((s) => ({
      form: mapField(s.form, fieldId, (f) => {
        const options = f.options ?? [];
        return { ...f, options: [...options, createOption(options.length + 1)] };
      }),
    })),

  updateOption: (fieldId, optionId, patch) =>
    set((s) => ({
      form: mapField(s.form, fieldId, (f) => ({
        ...f,
        options: (f.options ?? []).map((o) =>
          o.id === optionId ? { ...o, ...patch } : o,
        ),
      })),
    })),

  removeOption: (fieldId, optionId) =>
    set((s) => ({
      form: mapField(s.form, fieldId, (f) => ({
        ...f,
        options: (f.options ?? []).filter((o) => o.id !== optionId),
      })),
    })),

  addRule: () =>
    set((s) => {
      const fields = s.form.fields;
      if (fields.length === 0) return s;
      const source = fields[0];
      const target = fields.find((f) => f.id !== source.id) ?? source;
      const rule: FormRule = {
        id: uid("rule"),
        when: { fieldId: source.id, operator: "equals", value: "" },
        action: "require",
        targetFieldId: target.id,
      };
      return { form: touch({ ...s.form, rules: [...s.form.rules, rule] }) };
    }),

  updateRule: (id, patch) =>
    set((s) => ({
      form: touch({
        ...s.form,
        rules: s.form.rules.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      }),
    })),

  removeRule: (id) =>
    set((s) => ({
      form: touch({
        ...s.form,
        rules: s.form.rules.filter((r) => r.id !== id),
      }),
    })),

  resetForm: () =>
    set({ form: createEmptyForm(), selectedFieldId: null, fieldSeq: 0 }),
}));
