"use client";

import { MousePointerClick } from "lucide-react";

import { NodePanel } from "@/components/workflow-builder/node-panel";
import { EdgePanel } from "@/components/workflow-builder/edge-panel";
import { useWorkflowBuilderStore } from "@/stores/workflow-builder-store";
import { useTranslation } from "@/lib/i18n/use-translation";

export function Inspector() {
  const { t } = useTranslation();
  const selectedStepId = useWorkflowBuilderStore((s) => s.selectedStepId);
  const selectedTransition = useWorkflowBuilderStore((s) => s.selectedTransition);

  if (selectedStepId) return <NodePanel />;
  if (selectedTransition) return <EdgePanel />;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-muted-foreground">
      <MousePointerClick className="h-5 w-5" />
      <p className="text-sm">{t("wf.selectHint")}</p>
    </div>
  );
}
