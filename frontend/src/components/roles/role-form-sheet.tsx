"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRolesStore } from "@/stores/roles-store";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { RoleDefinition } from "@/types/auth";

/** Rol ekleme/düzenleme yan paneli. editingRole null ise ekleme modudur. */
export function RoleFormSheet({
  open,
  onOpenChange,
  editingRole,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRole: RoleDefinition | null;
}) {
  const { t } = useTranslation();
  const addRole = useRolesStore((s) => s.addRole);
  const editRole = useRolesStore((s) => s.editRole);

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const isEdit = !!editingRole;

  useEffect(() => {
    if (open) setName(editingRole?.name ?? "");
  }, [open, editingRole]);

  async function handleSave() {
    if (!name.trim()) {
      toast.error(t("roles.nameRequired"));
      return;
    }
    setSaving(true);
    const result = isEdit
      ? await editRole(editingRole!.id, name)
      : await addRole(name);
    setSaving(false);

    if (result === "ok") {
      toast.success(isEdit ? t("roles.updated") : t("roles.created"));
      onOpenChange(false);
    } else if (result === "taken") {
      toast.error(t("roles.nameTaken"));
    } else if (result === "locked") {
      toast.error(t("roles.systemLocked"));
    } else {
      toast.error(t("roles.nameRequired"));
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {isEdit ? t("roles.editRole") : t("roles.newRole")}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-4">
          <div className="space-y-1.5">
            <Label htmlFor="role-name">{t("roles.name")}</Label>
            <Input
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("common.save")}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("users.cancel")}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
