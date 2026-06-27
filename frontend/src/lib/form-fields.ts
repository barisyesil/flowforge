import {
  Type,
  AlignLeft,
  Hash,
  AtSign,
  ChevronDownSquare,
  CheckSquare,
  CircleDot,
  Calendar,
  type LucideIcon,
} from "lucide-react";

import type { FieldType } from "@/types/form";

/** Bir alan tipinin palet/panel davranışını tanımlayan meta veri. */
export type FieldTypeMeta = {
  type: FieldType;
  /** Palette ve panelde gösterilen Türkçe ad. */
  label: string;
  icon: LucideIcon;
  /** select / radio gibi seçenek listesi gerektirir mi? */
  hasOptions: boolean;
  /** metin uzunluğu / pattern doğrulaması anlamlı mı? */
  hasTextValidation: boolean;
  /** min / max sayısal doğrulama anlamlı mı? */
  hasNumberValidation: boolean;
};

export const fieldTypeMetas: FieldTypeMeta[] = [
  { type: "text", label: "Metin", icon: Type, hasOptions: false, hasTextValidation: true, hasNumberValidation: false },
  { type: "textarea", label: "Uzun Metin", icon: AlignLeft, hasOptions: false, hasTextValidation: true, hasNumberValidation: false },
  { type: "number", label: "Sayı", icon: Hash, hasOptions: false, hasTextValidation: false, hasNumberValidation: true },
  { type: "email", label: "E-posta", icon: AtSign, hasOptions: false, hasTextValidation: true, hasNumberValidation: false },
  { type: "select", label: "Açılır Liste", icon: ChevronDownSquare, hasOptions: true, hasTextValidation: false, hasNumberValidation: false },
  { type: "radio", label: "Seçenekler", icon: CircleDot, hasOptions: true, hasTextValidation: false, hasNumberValidation: false },
  { type: "checkbox", label: "Onay Kutusu", icon: CheckSquare, hasOptions: false, hasTextValidation: false, hasNumberValidation: false },
  { type: "date", label: "Tarih", icon: Calendar, hasOptions: false, hasTextValidation: false, hasNumberValidation: false },
];

export const fieldTypeMap: Record<FieldType, FieldTypeMeta> = Object.fromEntries(
  fieldTypeMetas.map((m) => [m.type, m]),
) as Record<FieldType, FieldTypeMeta>;
