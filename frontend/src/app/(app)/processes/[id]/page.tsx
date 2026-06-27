"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/process/status-badge";
import { useProcessesStore } from "@/stores/processes-store";
import { useAuthStore } from "@/stores/auth-store";
import { availableActions, canRoleAct, isTerminal } from "@/lib/process-machine";
import {
  processActionLabels,
  processStatusLabels,
  type ProcessAction,
} from "@/types/process";

export default function ProcessDetailPage() {
  const params = useParams();
  const id = String(params.id);

  const processes = useProcessesStore((s) => s.processes);
  const status = useProcessesStore((s) => s.status);
  const loadProcesses = useProcessesStore((s) => s.loadProcesses);
  const runAction = useProcessesStore((s) => s.runAction);
  const user = useAuthStore((s) => s.user);

  const [acting, setActing] = useState<ProcessAction | null>(null);

  useEffect(() => {
    loadProcesses();
  }, [loadProcesses]);

  const process = processes.find((p) => p.id === id);

  if (!process) {
    if (status === "loading") {
      return <Skeleton className="h-64 w-full max-w-3xl" />;
    }
    return (
      <Card>
        <div className="space-y-3 p-6">
          <p className="text-sm">Süreç bulunamadı.</p>
          <Button
            variant="outline"
            render={<Link href="/processes">Süreçlere dön</Link>}
          />
        </div>
      </Card>
    );
  }

  const actions = availableActions(process.status).filter(
    (a) => user && canRoleAct(user.role, a),
  );

  async function handleAction(action: ProcessAction) {
    if (!user) return;
    setActing(action);
    const updated = await runAction(process!.id, action, user.displayName);
    setActing(null);
    if (updated) {
      toast.success(`İşlem uygulandı: ${processActionLabels[action]}`);
    } else {
      toast.error("İşlem uygulanamadı.");
    }
  }

  const meta = [
    { label: "Başlatan", value: process.startedByName },
    { label: "Süreç ID", value: process.id, mono: true },
    {
      label: "Başlangıç",
      value: new Date(process.createdAt).toLocaleString("tr-TR"),
    },
    {
      label: "Son güncelleme",
      value: new Date(process.updatedAt).toLocaleString("tr-TR"),
    },
    { label: "Form", value: `${process.formName} (v${process.formVersion})` },
  ];

  return (
    <div className="max-w-3xl space-y-5">
      {/* Başlık */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          render={
            <Link href="/processes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          }
        />
        <div className="flex flex-1 items-center gap-2">
          <h2 className="text-lg font-semibold">{process.formName}</h2>
          <StatusBadge status={process.status} />
        </div>
      </div>

      {/* Meta + aksiyonlar */}
      <Card>
        <div className="space-y-4 p-5">
          <dl className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
            {meta.map((m) => (
              <div key={m.label}>
                <dt className="text-xs text-muted-foreground">{m.label}</dt>
                <dd
                  className={
                    m.mono ? "font-mono text-xs break-all" : "text-sm"
                  }
                >
                  {m.value}
                </dd>
              </div>
            ))}
          </dl>

          {actions.length > 0 && (
            <>
              <Separator />
              <div className="flex flex-wrap gap-2">
                {actions.map((action) => (
                  <Button
                    key={action}
                    variant={action === "reject" ? "destructive" : "default"}
                    disabled={acting !== null}
                    onClick={() => handleAction(action)}
                  >
                    {acting === action && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {processActionLabels[action]}
                  </Button>
                ))}
              </div>
            </>
          )}

          {actions.length === 0 && !isTerminal(process.status) && (
            <p className="text-xs text-muted-foreground">
              Bu süreçte işlem yapma yetkiniz yok.
            </p>
          )}
        </div>
      </Card>

      {/* Form verisi (JSON) */}
      <Card>
        <div className="p-5">
          <h3 className="mb-2 text-sm font-medium">Form Verisi (JSON)</h3>
          <pre className="max-h-96 overflow-auto rounded-lg border bg-muted/50 p-4 text-xs">
            {JSON.stringify(process.data, null, 2)}
          </pre>
        </div>
      </Card>

      {/* Süreç geçmişi */}
      <Card>
        <div className="p-5">
          <h3 className="mb-3 text-sm font-medium">Süreç Geçmişi</h3>
          <ol className="space-y-3">
            {[...process.history].reverse().map((ev) => (
              <li key={ev.id} className="flex gap-3 text-sm">
                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div>
                  <p>
                    <span className="font-medium">{ev.actorName}</span>{" "}
                    {ev.action === "start"
                      ? "süreci başlattı"
                      : processActionLabels[ev.action].toLowerCase() + "dı"}{" "}
                    <span className="text-muted-foreground">
                      ({processStatusLabels[ev.toStatus]})
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(ev.at).toLocaleString("tr-TR")}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Card>
    </div>
  );
}
