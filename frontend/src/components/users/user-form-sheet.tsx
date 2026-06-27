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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useUsersStore } from "@/stores/users-store";
import { useRolesStore } from "@/stores/roles-store";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useRoleLabel } from "@/hooks/use-role-label";
import type { NewUserInput } from "@/lib/api/users-api";
import type { User, Role } from "@/types/auth";

/** Kullanıcı ekleme/düzenleme yan paneli. editingUser null ise ekleme modudur. */
export function UserFormSheet({
  open,
  onOpenChange,
  editingUser,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: User | null;
}) {
  const { t } = useTranslation();
  const roleLabel = useRoleLabel();
  const addUser = useUsersStore((s) => s.addUser);
  const editUser = useUsersStore((s) => s.editUser);
  const roles = useRolesStore((s) => s.roles);

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("user");
  const [saving, setSaving] = useState(false);

  const isEdit = !!editingUser;

  // Panel açıldığında alanları (varsa) düzenlenen kullanıcıdan doldur.
  useEffect(() => {
    if (open) {
      setDisplayName(editingUser?.displayName ?? "");
      setUsername(editingUser?.username ?? "");
      setPassword("");
      setRole(editingUser?.role ?? "user");
    }
  }, [open, editingUser]);

  const roleItems = Object.fromEntries(
    roles.map((r) => [r.id, roleLabel(r.id)]),
  );

  async function handleSave() {
    if (
      !displayName.trim() ||
      !username.trim() ||
      (!isEdit && !password.trim())
    ) {
      toast.error(t("users.fillAll"));
      return;
    }

    setSaving(true);
    let result;
    if (isEdit && editingUser) {
      const patch: Partial<NewUserInput> = {
        displayName: displayName.trim(),
        username: username.trim(),
        role,
      };
      if (password.trim()) patch.password = password;
      result = await editUser(editingUser.id, patch);
    } else {
      result = await addUser({
        displayName: displayName.trim(),
        username: username.trim(),
        password,
        role,
      });
    }
    setSaving(false);

    if (result === "ok") {
      toast.success(isEdit ? t("users.updated") : t("users.created"));
      onOpenChange(false);
    } else if (result === "taken") {
      toast.error(t("users.usernameTaken"));
    } else {
      toast.error(t("users.fillAll"));
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {isEdit ? t("users.editUser") : t("users.newUser")}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-4">
          <div className="space-y-1.5">
            <Label htmlFor="u-name">{t("users.displayName")}</Label>
            <Input
              id="u-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="u-username">{t("users.username")}</Label>
            <Input
              id="u-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="u-pass">{t("users.password")}</Label>
            <Input
              id="u-pass"
              type="password"
              value={password}
              placeholder={isEdit ? "••••••" : ""}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t("users.role")}</Label>
            <Select
              value={role}
              items={roleItems}
              onValueChange={(v) => setRole(v as Role)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {roleLabel(r.id)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
