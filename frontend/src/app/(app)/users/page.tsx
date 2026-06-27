"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Inbox } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RoleGuard } from "@/components/auth/role-guard";
import { UserFormSheet } from "@/components/users/user-form-sheet";
import { useUsersStore } from "@/stores/users-store";
import { useAuthStore } from "@/stores/auth-store";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { User } from "@/types/auth";

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function UsersContent() {
  const { t } = useTranslation();
  const users = useUsersStore((s) => s.users);
  const status = useUsersStore((s) => s.status);
  const loadUsers = useUsersStore((s) => s.loadUsers);
  const deleteUser = useUsersStore((s) => s.deleteUser);
  const currentUser = useAuthStore((s) => s.user);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function openAdd() {
    setEditing(null);
    setSheetOpen(true);
  }

  function openEdit(user: User) {
    setEditing(user);
    setSheetOpen(true);
  }

  async function handleDelete(user: User) {
    if (!window.confirm(t("users.deleteConfirm"))) return;
    const ok = await deleteUser(user.id);
    if (ok) toast.success(t("users.deleted"));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{t("users.subtitle")}</p>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" />
          {t("users.add")}
        </Button>
      </div>

      {status === "loading" && users.length === 0 ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : users.length === 0 ? (
        <Card>
          <CardHeader className="items-center text-center">
            <Inbox className="mb-1 h-6 w-6 text-muted-foreground" />
            <CardTitle className="text-base">{t("users.empty")}</CardTitle>
            <CardDescription>{t("users.subtitle")}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-2">
          {users.map((user) => {
            const isSelf = user.id === currentUser?.id;
            return (
              <div
                key={user.id}
                className="flex items-center gap-3 rounded-xl border bg-card p-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {initials(user.displayName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {user.displayName}{" "}
                    {isSelf && (
                      <span className="text-xs font-normal text-muted-foreground">
                        {t("users.you")}
                      </span>
                    )}
                  </p>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {user.username}
                  </p>
                </div>
                <Badge variant="secondary" className="font-normal">
                  {t(`role.${user.role}`)}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => openEdit(user)}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">{t("users.edit")}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={isSelf}
                  onClick={() => handleDelete(user)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span className="sr-only">{t("users.delete")}</span>
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <UserFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editingUser={editing}
      />
    </div>
  );
}

export default function UsersPage() {
  return (
    <RoleGuard allow={["admin"]}>
      <UsersContent />
    </RoleGuard>
  );
}
