"use client";

import { Languages, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { Language } from "@/lib/i18n/dictionaries";

const LANGUAGES: { value: Language; labelKey: "lang.tr" | "lang.en" }[] = [
  { value: "tr", labelKey: "lang.tr" },
  { value: "en", labelKey: "lang.en" },
];

export function LanguageSwitcher() {
  const { t, language, setLanguage } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon">
            <Languages className="h-5 w-5" />
            <span className="sr-only">{t("lang.label")}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {LANGUAGES.map((l) => (
          <DropdownMenuItem key={l.value} onClick={() => setLanguage(l.value)}>
            <Check
              className={
                language === l.value ? "h-4 w-4 opacity-100" : "h-4 w-4 opacity-0"
              }
            />
            {t(l.labelKey)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
