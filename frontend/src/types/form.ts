/**
 * Form veri modeli.
 *
 * Bu model uygulamanın üç yerinde de AYNI kalır:
 *   1. Form Tasarla (Adım 1)  — yapı burada kurulur
 *   2. Formu Başlat (Adım 2)   — bu yapıya göre alanlar render edilir ve doğrulanır
 *   3. Detay (Adım 3)          — girilen veri JSON olarak gösterilir
 *
 * Backend `FormDefinition`'ı JSON olarak saklayacağından (doküman gereği),
 * buradaki tipler backend modeliyle birebir örtüşür.
 */

/** Desteklenen alan tipleri. (text/select/checkbox zorunlu; gerisi tip doğrulamasını zenginleştirir.) */
export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "select"
  | "checkbox"
  | "radio"
  | "date";

/** Bir alana girilebilecek değer türleri. */
export type FieldValue = string | number | boolean | string[] | null;

/** select / radio gibi alanların seçenekleri. */
export type FieldOption = {
  id: string;
  label: string;
  value: string;
};

/** Tip bazlı doğrulama kuralları (alanın tipine göre alt küme kullanılır). */
export type FieldValidation = {
  /** metin alanları */
  minLength?: number;
  maxLength?: number;
  /** sayısal alanlar */
  min?: number;
  max?: number;
  /** serbest regex (ör. e-posta, telefon) */
  pattern?: string;
};

/** Tek bir form alanının tanımı. */
export type FormField = {
  /** Kararlı kimlik: sıralama, kural hedefleme ve veri eşlemesi için. */
  id: string;
  type: FieldType;
  /** Kullanıcıya gösterilen etiket. */
  label: string;
  /** JSON verisindeki makine anahtarı (ör. "email"). label'dan bağımsızdır. */
  name: string;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  defaultValue?: FieldValue;
  /** select / radio için seçenekler. */
  options?: FieldOption[];
  /** tip bazlı doğrulama. */
  validation?: FieldValidation;
};

/* ------------------------------------------------------------------ */
/*  Kural motoru — bağımlı validasyon ve koşullu görünürlük            */
/* ------------------------------------------------------------------ */

/** Bir kuralın tetiklenme koşulu. */
export type RuleOperator =
  | "equals"
  | "notEquals"
  | "isChecked"
  | "isNotEmpty"
  | "in";

export type RuleCondition = {
  /** Koşulun bakacağı kaynak alan. */
  fieldId: string;
  operator: RuleOperator;
  /** "equals"/"in" gibi operatörler için karşılaştırma değeri. */
  value?: string | string[];
};

/** Koşul sağlandığında uygulanacak aksiyon. */
export type RuleAction = "require" | "show" | "hide";

/**
 * Genel kural: "when (koşul) → action (hedef alan)".
 * Örnek bağımlı validasyon: when {A equals 'Evet'} → require B.
 * Örnek koşullu görünürlük: when {A isChecked} → show B.
 */
export type FormRule = {
  id: string;
  when: RuleCondition;
  action: RuleAction;
  targetFieldId: string;
};

/* ------------------------------------------------------------------ */
/*  Form tanımı ve gönderilen veri                                     */
/* ------------------------------------------------------------------ */

/** Tasarlanan formun tamamı — "backend'e gönderilecek model". */
export type FormDefinition = {
  id: string;
  name: string;
  description?: string;
  /** Sıralama dizinin sırasıyla belirlenir (alan sıralama bonusu doğal gelir). */
  fields: FormField[];
  /** Bağımlı validasyon / koşullu mantık kuralları. */
  rules: FormRule[];
  /** Form her güncellendiğinde artar; süreç o anki sürümle ilişkilendirilir. */
  version: number;
  createdAt: string;
  updatedAt: string;
};

/** Adım 2'de doldurulan ve Adım 3'te JSON olarak gösterilen veri. */
export type FormSubmission = Record<string, FieldValue>;
