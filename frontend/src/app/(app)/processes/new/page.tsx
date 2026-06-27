"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, FileText, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FormRunner } from "@/components/form-runner/form-runner";
import { useFormsStore } from "@/stores/forms-store";
import { useProcessesStore } from "@/stores/processes-store";
import { useAuthStore } from "@/stores/auth-store";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { FormSubmission } from "@/types/form";

export default function NewProcessPage() {
  const router = useRouter();
  const forms = useFormsStore((s) => s.forms);
  const status = useFormsStore((s) => s.status);
  const loadForms = useFormsStore((s) => s.loadForms);
  const startProcess = useProcessesStore((s) => s.startProcess);
  const user = useAuthStore((s) => s.user);
  const { t } = useTranslation();

  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  const selected = forms.find((f) => f.id === selectedId);

  async function handleStart(payload: FormSubmission) {
    if (!selected || !user) throw new Error("Eksik bağlam");
    const created = await startProcess(selected, payload, user.displayName);
    if (!created) throw new Error("Süreç başlatılamadı");
    toast.success(t("newProcess.started"));
    router.push(`/processes/${created.id}`);
  }

  // Yükleniyor
  if (status === "loading" && forms.length === 0) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  // Hiç form yok
  if (forms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("newProcess.noForms")}</CardTitle>
          <CardDescription>{t("newProcess.noFormsHint")}</CardDescription>
        </CardHeader>
        <div className="px-6 pb-6">
          <Button render={<Link href="/forms">{t("newProcess.goToDesign")}</Link>} />
        </div>
      </Card>
    );
  }

  // Form seçildi → doldurma ekranı
  if (selected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSelectedId(null)}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Geri</span>
          </Button>
          <div>
            <h2 className="text-sm font-semibold">{selected.name}</h2>
            <p className="text-xs text-muted-foreground">
              {t("newProcess.fields", { count: selected.fields.length })} · v
              {selected.version}
            </p>
          </div>
        </div>
        <Card>
          <div className="p-6">
            <FormRunner form={selected} onSubmit={handleStart} />
          </div>
        </Card>
      </div>
    );
  }

  // Form seçici
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t("newProcess.pickForm")}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {forms.map((form) => (
          <button
            key={form.id}
            type="button"
            onClick={() => setSelectedId(form.id)}
            className="flex items-center gap-3 rounded-xl border bg-card p-4 text-left transition-colors hover:bg-muted/50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{form.name}</p>
              <p className="text-xs text-muted-foreground">
                {t("newProcess.fields", { count: form.fields.length })}
              </p>
            </div>
            <Badge variant="secondary" className="font-normal">
              v{form.version}
            </Badge>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}
