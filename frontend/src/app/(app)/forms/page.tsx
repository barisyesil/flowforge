import { FormBuilder } from "@/components/form-builder/form-builder";
import { RoleGuard } from "@/components/auth/role-guard";

export default function FormsPage() {
  return (
    <RoleGuard allow={["admin"]}>
      <FormBuilder />
    </RoleGuard>
  );
}
