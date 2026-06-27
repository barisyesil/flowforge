"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { FormField, FieldValue } from "@/types/form";

type Props = {
  field: FormField;
  value: FieldValue | undefined;
  required: boolean;
  error?: string;
  onChange: (value: FieldValue) => void;
};

/**
 * Tek bir form alanını tipine göre uygun girişle render eder.
 * Form tanımındaki yapıya birebir bağlıdır — Adım 2 (Formu Başlat) bunu kullanır.
 */
export function FieldInput({ field, value, required, error, onChange }: Props) {
  const requiredMark = required ? (
    <span className="text-destructive"> *</span>
  ) : null;

  function renderControl() {
    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            id={field.id}
            value={(value as string) ?? ""}
            placeholder={field.placeholder}
            aria-invalid={!!error}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      case "number":
        return (
          <Input
            id={field.id}
            type="number"
            value={(value as string) ?? ""}
            placeholder={field.placeholder}
            aria-invalid={!!error}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      case "email":
        return (
          <Input
            id={field.id}
            type="email"
            value={(value as string) ?? ""}
            placeholder={field.placeholder}
            aria-invalid={!!error}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      case "date":
        return (
          <Input
            id={field.id}
            type="date"
            value={(value as string) ?? ""}
            aria-invalid={!!error}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      case "checkbox":
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              id={field.id}
              checked={value === true}
              aria-invalid={!!error}
              onCheckedChange={(checked) => onChange(checked === true)}
            />
            <Label htmlFor={field.id} className="font-normal">
              {field.label}
              {requiredMark}
            </Label>
          </div>
        );

      case "select": {
        const options = field.options ?? [];
        const items = Object.fromEntries(options.map((o) => [o.value, o.label]));
        return (
          <Select
            value={(value as string) ?? null}
            items={items}
            onValueChange={(v) => onChange(v as string)}
          >
            <SelectTrigger id={field.id} className="w-full" aria-invalid={!!error}>
              <SelectValue placeholder={field.placeholder || "Seçiniz"} />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.id} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      case "radio": {
        const options = field.options ?? [];
        return (
          <RadioGroup
            value={(value as string) ?? ""}
            onValueChange={(v) => onChange(v as string)}
          >
            {options.map((o) => (
              <div key={o.id} className="flex items-center gap-2">
                <RadioGroupItem id={`${field.id}-${o.id}`} value={o.value} />
                <Label htmlFor={`${field.id}-${o.id}`} className="font-normal">
                  {o.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
      }

      default:
        return (
          <Input
            id={field.id}
            value={(value as string) ?? ""}
            placeholder={field.placeholder}
            aria-invalid={!!error}
            onChange={(e) => onChange(e.target.value)}
          />
        );
    }
  }

  return (
    <div className="space-y-1.5">
      {/* checkbox kendi etiketini içerir */}
      {field.type !== "checkbox" && (
        <Label htmlFor={field.id}>
          {field.label}
          {requiredMark}
        </Label>
      )}
      {renderControl()}
      {field.helpText && !error && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
