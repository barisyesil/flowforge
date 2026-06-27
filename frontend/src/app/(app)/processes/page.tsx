"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Plus, Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/process/status-badge";
import { useProcessesStore } from "@/stores/processes-store";

export default function ProcessesPage() {
  const processes = useProcessesStore((s) => s.processes);
  const status = useProcessesStore((s) => s.status);
  const loadProcesses = useProcessesStore((s) => s.loadProcesses);

  useEffect(() => {
    loadProcesses();
  }, [loadProcesses]);

  const sorted = [...processes].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Başlattığınız ve takip ettiğiniz süreçler.
        </p>
        <Button
          render={
            <Link href="/processes/new">
              <Plus className="h-4 w-4" />
              Yeni Süreç Başlat
            </Link>
          }
        />
      </div>

      {status === "loading" && processes.length === 0 ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : sorted.length === 0 ? (
        <Card>
          <CardHeader className="items-center text-center">
            <Inbox className="mb-1 h-6 w-6 text-muted-foreground" />
            <CardTitle className="text-base">Henüz süreç yok</CardTitle>
            <CardDescription>
              &quot;Yeni Süreç Başlat&quot; ile bir form üzerinden süreç başlatın.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-2">
          {sorted.map((process) => (
            <Link
              key={process.id}
              href={`/processes/${process.id}`}
              className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{process.formName}</p>
                <p className="text-xs text-muted-foreground">
                  {process.startedByName} ·{" "}
                  {new Date(process.createdAt).toLocaleString("tr-TR")}
                </p>
              </div>
              <StatusBadge status={process.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
