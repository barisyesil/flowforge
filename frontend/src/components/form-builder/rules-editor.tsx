"use client";

import { Plus, Trash2, GitBranch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import type { RuleOperator, RuleAction } from "@/types/form";

const OPERATORS: { value: RuleOperator; label: string }[] = [
  { value: "equals", label: "şuna eşitse" },
  { value: "notEquals", label: "şuna eşit değilse" },
  { value: "isChecked", label: "işaretliyse" },
  { value: "isNotEmpty", label: "doluysa" },
];

const ACTIONS: { value: RuleAction; label: string }[] = [
  { value: "require", label: "zorunlu olur" },
  { value: "show", label: "görünür olur" },
  { value: "hide", label: "gizlenir" },
];

/** Tekrarı azaltan küçük yardımcı select. */
function SimpleSelect({
  value,
  onValueChange,
  options,
  placeholder,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}) {
  const items = Object.fromEntries(options.map((o) => [o.value, o.label]));
  return (
    <Select value={value} items={items} onValueChange={(v) => onValueChange(v as string)}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * Kural Builder: bağımlı validasyon ve koşullu görünürlük kuralları.
 * "Eğer [alan] [operatör] [değer] ise → [hedef alan] [aksiyon]".
 */
export function RulesEditor() {
  const fields = useFormBuilderStore((s) => s.form.fields);
  const rules = useFormBuilderStore((s) => s.form.rules);
  const addRule = useFormBuilderStore((s) => s.addRule);
  const updateRule = useFormBuilderStore((s) => s.updateRule);
  const removeRule = useFormBuilderStore((s) => s.removeRule);

  const fieldOptions = fields.map((f) => ({ value: f.id, label: f.label }));

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Kurallar (koşullu mantık)</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={addRule}
          disabled={fields.length === 0}
        >
          <Plus className="h-4 w-4" />
          Kural Ekle
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Kural eklemek için önce alan ekleyin.
        </p>
      ) : rules.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Henüz kural yok. Örnek: &quot;Eğer A alanı &apos;Evet&apos; ise B alanı
          zorunlu olur&quot;.
        </p>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => {
            const sourceField = fields.find((f) => f.id === rule.when.fieldId);
            const needsValue =
              rule.when.operator === "equals" ||
              rule.when.operator === "notEquals";
            const sourceOptions = sourceField?.options ?? [];

            return (
              <div
                key={rule.id}
                className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-3 text-sm"
              >
                <span className="text-muted-foreground">Eğer</span>

                {/* Kaynak alan */}
                <SimpleSelect
                  className="w-40"
                  value={rule.when.fieldId}
                  onValueChange={(v) =>
                    updateRule(rule.id, {
                      when: { ...rule.when, fieldId: v },
                    })
                  }
                  options={fieldOptions}
                  placeholder="alan"
                />

                {/* Operatör */}
                <SimpleSelect
                  className="w-44"
                  value={rule.when.operator}
                  onValueChange={(v) =>
                    updateRule(rule.id, {
                      when: { ...rule.when, operator: v as RuleOperator },
                    })
                  }
                  options={OPERATORS}
                />

                {/* Değer (yalnızca eşitlik operatörlerinde) */}
                {needsValue &&
                  (sourceOptions.length > 0 ? (
                    <SimpleSelect
                      className="w-36"
                      value={String(rule.when.value ?? "")}
                      onValueChange={(v) =>
                        updateRule(rule.id, {
                          when: { ...rule.when, value: v },
                        })
                      }
                      options={sourceOptions.map((o) => ({
                        value: o.value,
                        label: o.label,
                      }))}
                      placeholder="değer"
                    />
                  ) : (
                    <Input
                      className="h-8 w-36"
                      value={String(rule.when.value ?? "")}
                      placeholder="değer"
                      onChange={(e) =>
                        updateRule(rule.id, {
                          when: { ...rule.when, value: e.target.value },
                        })
                      }
                    />
                  ))}

                <span className="text-muted-foreground">ise</span>

                {/* Hedef alan */}
                <SimpleSelect
                  className="w-40"
                  value={rule.targetFieldId}
                  onValueChange={(v) =>
                    updateRule(rule.id, { targetFieldId: v })
                  }
                  options={fieldOptions}
                  placeholder="hedef alan"
                />

                {/* Aksiyon */}
                <SimpleSelect
                  className="w-36"
                  value={rule.action}
                  onValueChange={(v) =>
                    updateRule(rule.id, { action: v as RuleAction })
                  }
                  options={ACTIONS}
                />

                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="ml-auto"
                  onClick={() => removeRule(rule.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span className="sr-only">Kuralı sil</span>
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
