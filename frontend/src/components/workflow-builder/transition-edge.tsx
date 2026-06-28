import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
  type Edge,
} from "@xyflow/react";
import { GitBranch } from "lucide-react";

import { cn } from "@/lib/utils";

export type TransitionEdgeData = {
  label: string;
  hasCondition: boolean;
};
export type TransitionEdgeType = Edge<TransitionEdgeData, "transition">;

export function TransitionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}: EdgeProps<TransitionEdgeType>) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{
          strokeWidth: 2,
          stroke: selected ? "var(--primary)" : "var(--border)",
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
          className={cn(
            "nodrag nopan absolute flex items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-xs font-medium shadow-sm",
            selected ? "border-primary text-primary" : "text-foreground",
          )}
        >
          {data?.hasCondition && (
            <GitBranch className="h-3 w-3 text-amber-500" />
          )}
          {data?.label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
