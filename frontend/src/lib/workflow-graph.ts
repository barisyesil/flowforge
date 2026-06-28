import type { TransitionTarget } from "@/types/workflow";

/** Görsel tasarımcıdaki özel (adım olmayan) node id'leri. */
export const START_NODE_ID = "__start__";
export const END_COMPLETED_ID = "__end_completed__";
export const END_REJECTED_ID = "__end_rejected__";

export function isSpecialNode(id: string): boolean {
  return (
    id === START_NODE_ID ||
    id === END_COMPLETED_ID ||
    id === END_REJECTED_ID
  );
}

/** Bir bağlantı hedefini (canvas node id'si) TransitionTarget'a çevirir. */
export function nodeIdToTarget(nodeId: string): TransitionTarget {
  if (nodeId === END_COMPLETED_ID) return { type: "end", outcome: "completed" };
  if (nodeId === END_REJECTED_ID) return { type: "end", outcome: "rejected" };
  return { type: "step", stepId: nodeId };
}

/** Bir TransitionTarget'ı canvas hedef node id'sine çevirir. */
export function targetToNodeId(target: TransitionTarget): string {
  if (target.type === "end") {
    return target.outcome === "completed" ? END_COMPLETED_ID : END_REJECTED_ID;
  }
  return target.stepId;
}
