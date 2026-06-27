"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleGuard } from "@/components/auth/role-guard";
import { RoleFormSheet } from "@/components/roles/role-form-sheet";
import { useRolesStore } from "@/stores/roles-store";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useRoleLabel } from "@/hooks/use-role-label";
import type { RoleDefinition } from "@/types/auth";

function RolesContent() {
  const { t } = useTranslation();
  const roleLabel = useRoleLabel();
  const roles = useRolesStore((s) => s.roles);
  const status = useRolesStore((s) => s.status);
  const loadRoles = useRolesStore((s) => s.loadRoles);
  const deleteRole = useRolesStore((s) => s.deleteRole);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<RoleDefinition | null>(null);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  function openAdd() {
    setEditing(null);
    setSheetOpen(true);
  }

  function openEdit(role: RoleDefinition) {
    setEditing(role);
    setSheetOpen(true);
  }

  async function handleDelete(role: RoleDefinition) {
    if (!window.confirm(t("roles.deleteConfirm"))) return;
    const result = await deleteRole(role.id);
    if (result === "ok") toast.success(t("roles.deleted"));
    else if (result === "locked") toast.error(t("roles.systemLocked"));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{t("roles.subtitle")}</p>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" />
          {t("roles.add")}
        </Button>
      </div>

      {status === "loading" && roles.length === 0 ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : (
        <div className="space-y-2">
          {roles.map((role) => (
            <div
              key={role.id}
              className="flex items-center gap-3 rounded-xl border bg-card p-4"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {roleLabel(role.id)}
                </p>
                <p className="truncate font-mono text-xs text-muted-foreground">
                  {role.id}
                </p>
              </div>
              {role.isSystem && (
                <Badge variant="secondary" className="font-normal">
                  {t("roles.system")}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={role.isSystem}
                onClick={() => openEdit(role)}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">{t("users.edit")}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={role.isSystem}
                onClick={() => handleDelete(role)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
                <span className="sr-only">{t("users.delete")}</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      <RoleFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editingRole={editing}
      />
    </div>
  );
}

export default function RolesPage() {
  return (
    <RoleGuard allow={["admin"]}>
      <RolesContent />
    </RoleGuard>
  );
}
