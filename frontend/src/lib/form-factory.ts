import { uid } from "@/lib/id";
import { fieldTypeMap } from "@/lib/form-fields";
import type {
  FieldType,
  FormField,
  FieldOption,
  FormDefinition,
} from "@/types/form";

/** Yeni bir seçenek (select/radio) üretir. */
export function createOption(index: number): FieldOption {
  return {
    id: uid("opt"),
    label: `Seçenek ${index}`,
    value: `secenek_${index}`,
  };
}

/**
 * Verilen tipte, makul varsayılanlarla yeni bir alan üretir.
 * `index` benzersiz bir makine adı (`name`) üretmek için kullanılır.
 */
export function createField(type: FieldType, index: number): FormField {
  const meta = fieldTypeMap[type];
  const field: FormField = {
    id: uid("fld"),
    type,
    label: `${meta.label} ${index}`,
    name: `${type}_${index}`,
    required: false,
  };

  if (meta.hasOptions) {
    field.options = [createOption(1), createOption(2)];
  }

  return field;
}

/** Boş bir form taslağı üretir. */
export function createEmptyForm(): FormDefinition {
  const now = new Date().toISOString();
  return {
    id: uid("form"),
    name: "Yeni Form",
    description: "",
    fields: [],
    rules: [],
    version: 1,
    createdAt: now,
    updatedAt: now,
  };
}
