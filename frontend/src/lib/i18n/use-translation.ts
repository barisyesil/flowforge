"use client";

import { useI18nStore } from "@/stores/i18n-store";
import { dictionaries, type TranslationKey } from "@/lib/i18n/dictionaries";

/**
 * Çeviri hook'u. `t("key", { değişken: değer })` ile metin döner;
 * yer tutucular ({değişken}) verilen değerlerle değiştirilir.
 */
export function useTranslation() {
  const language = useI18nStore((s) => s.language);
  const setLanguage = useI18nStore((s) => s.setLanguage);

  function t(key: TranslationKey, vars?: Record<string, string | number>): string {
    let text: string = dictionaries[language][key] ?? key;
    if (vars) {
      for (const [name, value] of Object.entries(vars)) {
        text = text.replaceAll(`{${name}}`, String(value));
      }
    }
    return text;
  }

  return { t, language, setLanguage };
}
