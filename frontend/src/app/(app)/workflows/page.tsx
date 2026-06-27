import { WorkflowBuilder } from "@/components/workflow-builder/workflow-builder";
import { RoleGuard } from "@/components/auth/role-guard";

export default function WorkflowsPage() {
  return (
    <RoleGuard allow={["admin"]}>
      <WorkflowBuilder />
    </RoleGuard>
  );
}
