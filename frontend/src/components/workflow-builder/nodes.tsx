import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { Play, CheckCircle2, XCircle, FileText, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

const handleBase =
  "!h-2.5 !w-2.5 !rounded-full !border-2 !border-background";

/* ----------------------------- Adım node'u ----------------------------- */

export type StepNodeData = {
  name: string;
  formLabel: string | null;
  assigneeLabel: string | null;
  isStart: boolean;
};
export type StepNodeType = Node<StepNodeData, "step">;

export function StepNode({ data, selected }: NodeProps<StepNodeType>) {
  return (
    <div
      className={cn(
        "w-56 rounded-xl border bg-card shadow-sm backdrop-blur transition-all",
        selected
          ? "border-primary ring-2 ring-primary/30"
          : "hover:shadow-md hover:-translate-y-0.5",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className={cn(handleBase, "!bg-muted-foreground")}
      />

      <div className="flex items-center gap-2 border-b px-3 py-2">
        {data.isStart && (
          <span
            className="h-2 w-2 shrink-0 rounded-full bg-primary"
            title="Başlangıç"
          />
        )}
        <p className="truncate text-sm font-semibold">{data.name}</p>
      </div>

      <div className="space-y-1.5 px-3 py-2">
        <div className="flex items-center gap-1.5 text-xs">
          <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className={cn("truncate", !data.formLabel && "text-muted-foreground")}>
            {data.formLabel ?? "—"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <UserRound className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className={cn("truncate", !data.assigneeLabel && "text-muted-foreground")}>
            {data.assigneeLabel ?? "—"}
          </span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className={cn(handleBase, "!bg-primary")}
      />
    </div>
  );
}

/* ---------------------------- Başlangıç node'u --------------------------- */

export type StartNodeData = { label: string };
export type StartNodeType = Node<StartNodeData, "start">;

export function StartNode({ data }: NodeProps<StartNodeType>) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm">
      <Play className="h-3.5 w-3.5" />
      {data.label}
      <Handle
        type="source"
        position={Position.Right}
        className={cn(handleBase, "!bg-primary")}
      />
    </div>
  );
}

/* ------------------------------ Bitiş node'u ----------------------------- */

export type EndNodeData = { outcome: "completed" | "rejected"; label: string };
export type EndNodeType = Node<EndNodeData, "end">;

export function EndNode({ data }: NodeProps<EndNodeType>) {
  const done = data.outcome === "completed";
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm",
        done
          ? "border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400"
          : "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className={cn(handleBase, done ? "!bg-green-500" : "!bg-red-500")}
      />
      {done ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <XCircle className="h-3.5 w-3.5" />
      )}
      {data.label}
    </div>
  );
}
