"use client";

import "@xyflow/react/dist/style.css";

import { useCallback, useMemo } from "react";
import { useTheme } from "next-themes";
import { Plus, GripVertical } from "lucide-react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  MarkerType,
  useReactFlow,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "@xyflow/react";

import { StepNode, StartNode, EndNode } from "@/components/workflow-builder/nodes";
import { TransitionEdge } from "@/components/workflow-builder/transition-edge";
import { useWorkflowBuilderStore } from "@/stores/workflow-builder-store";
import { useFormsStore } from "@/stores/forms-store";
import { useUsersStore } from "@/stores/users-store";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useRoleLabel } from "@/hooks/use-role-label";
import {
  START_NODE_ID,
  END_COMPLETED_ID,
  END_REJECTED_ID,
  isSpecialNode,
  nodeIdToTarget,
  targetToNodeId,
} from "@/lib/workflow-graph";
import type { WorkflowStep } from "@/types/workflow";

const nodeTypes = { step: StepNode, start: StartNode, end: EndNode };
const edgeTypes = { transition: TransitionEdge };
const arrow = { type: MarkerType.ArrowClosed, width: 16, height: 16 };

export function WorkflowCanvas() {
  const { t } = useTranslation();
  const roleLabel = useRoleLabel();
  const { resolvedTheme } = useTheme();
  const { screenToFlowPosition } = useReactFlow();

  const workflow = useWorkflowBuilderStore((s) => s.workflow);
  const selectedStepId = useWorkflowBuilderStore((s) => s.selectedStepId);
  const selectedTransition = useWorkflowBuilderStore((s) => s.selectedTransition);
  const setNodePosition = useWorkflowBuilderStore((s) => s.setNodePosition);
  const removeStep = useWorkflowBuilderStore((s) => s.removeStep);
  const setStartStep = useWorkflowBuilderStore((s) => s.setStartStep);
  const connectTransition = useWorkflowBuilderStore((s) => s.connectTransition);
  const removeTransition = useWorkflowBuilderStore((s) => s.removeTransition);
  const addStepAt = useWorkflowBuilderStore((s) => s.addStepAt);
  const selectStep = useWorkflowBuilderStore((s) => s.selectStep);
  const selectTransition = useWorkflowBuilderStore((s) => s.selectTransition);
  const clearSelection = useWorkflowBuilderStore((s) => s.clearSelection);

  const forms = useFormsStore((s) => s.forms);
  const users = useUsersStore((s) => s.users);

  const assigneeLabel = useCallback(
    (step: WorkflowStep): string | null => {
      if (step.assigneeUserId) {
        return users.find((u) => u.id === step.assigneeUserId)?.displayName ?? null;
      }
      if (step.assigneeRole) return roleLabel(step.assigneeRole);
      return null;
    },
    [users, roleLabel],
  );

  const nodes = useMemo<Node[]>(() => {
    const layout = workflow.layout ?? {};
    const list: Node[] = [
      {
        id: START_NODE_ID,
        type: "start",
        position: layout[START_NODE_ID] ?? { x: 40, y: 200 },
        data: { label: t("wf.start") },
        selectable: false,
        deletable: false,
      },
    ];

    for (const step of workflow.steps) {
      list.push({
        id: step.id,
        type: "step",
        position: layout[step.id] ?? { x: 320, y: 190 },
        selected: step.id === selectedStepId,
        data: {
          name: step.name,
          formLabel: step.formId
            ? (forms.find((f) => f.id === step.formId)?.name ?? null)
            : null,
          assigneeLabel: assigneeLabel(step),
          isStart: step.id === workflow.startStepId,
        },
      });
    }

    list.push(
      {
        id: END_COMPLETED_ID,
        type: "end",
        position: layout[END_COMPLETED_ID] ?? { x: 660, y: 110 },
        data: { outcome: "completed", label: t("status.completed") },
        selectable: false,
        deletable: false,
      },
      {
        id: END_REJECTED_ID,
        type: "end",
        position: layout[END_REJECTED_ID] ?? { x: 660, y: 300 },
        data: { outcome: "rejected", label: t("status.rejected") },
        selectable: false,
        deletable: false,
      },
    );
    return list;
  }, [workflow, selectedStepId, forms, assigneeLabel, t]);

  const edges = useMemo<Edge[]>(() => {
    const list: Edge[] = [];
    if (workflow.startStepId) {
      list.push({
        id: "start-edge",
        source: START_NODE_ID,
        target: workflow.startStepId,
        type: "transition",
        data: { label: "", hasCondition: false },
        markerEnd: arrow,
        animated: true,
        selectable: false,
        deletable: false,
      });
    }
    for (const step of workflow.steps) {
      for (const tr of step.transitions) {
        list.push({
          id: tr.id,
          source: step.id,
          target: targetToNodeId(tr.target),
          type: "transition",
          selected: selectedTransition?.transitionId === tr.id,
          data: { label: tr.label, hasCondition: !!tr.condition },
          markerEnd: arrow,
          animated: true,
        });
      }
    }
    return list;
  }, [workflow, selectedTransition]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      for (const c of changes) {
        if (c.type === "position" && c.position) setNodePosition(c.id, c.position);
        else if (c.type === "remove") removeStep(c.id);
      }
    },
    [setNodePosition, removeStep],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      for (const c of changes) {
        if (c.type === "remove") {
          const owner = workflow.steps.find((st) =>
            st.transitions.some((tr) => tr.id === c.id),
          );
          if (owner) removeTransition(owner.id, c.id);
        }
      }
    },
    [workflow, removeTransition],
  );

  const onConnect = useCallback(
    (conn: Connection) => {
      if (!conn.source || !conn.target || conn.target === START_NODE_ID) return;
      if (conn.source === START_NODE_ID) {
        if (!isSpecialNode(conn.target)) setStartStep(conn.target);
        return;
      }
      if (isSpecialNode(conn.source)) return;
      connectTransition(conn.source, nodeIdToTarget(conn.target));
    },
    [setStartStep, connectTransition],
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (event.dataTransfer.getData("application/flowforge") !== "step") return;
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      addStepAt(position);
    },
    [screenToFlowPosition, addStepAt],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border bg-card">
      {/* Palet */}
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-2 rounded-lg border bg-background/90 p-2 shadow-sm backdrop-blur">
        <span className="px-1 text-xs font-medium text-muted-foreground">
          {t("wf.addStep")}
        </span>
        <div
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("application/flowforge", "step");
            e.dataTransfer.effectAllowed = "move";
          }}
          onClick={() => addStepAt({ x: 340, y: 200 + workflow.steps.length * 30 })}
          className="flex cursor-grab items-center gap-1.5 rounded-md border bg-card px-2.5 py-1.5 text-xs font-medium shadow-sm transition-colors hover:bg-muted active:cursor-grabbing"
        >
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
          <Plus className="h-3.5 w-3.5" />
          {t("wf.stepName")}
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={(_, node) =>
          node.type === "step" ? selectStep(node.id) : clearSelection()
        }
        onEdgeClick={(_, edge) => {
          if (edge.id === "start-edge") return;
          const owner = workflow.steps.find((st) =>
            st.transitions.some((tr) => tr.id === edge.id),
          );
          if (owner) selectTransition({ stepId: owner.id, transitionId: edge.id });
        }}
        onPaneClick={() => clearSelection()}
        colorMode={resolvedTheme === "dark" ? "dark" : "light"}
        fitView
        proOptions={{ hideAttribution: false }}
        defaultEdgeOptions={{ type: "transition" }}
      >
        <Background variant={BackgroundVariant.Dots} gap={18} size={1.5} />
        <Controls className="!shadow-sm" />
        <MiniMap
          pannable
          zoomable
          className="!rounded-lg !border"
          nodeColor="var(--muted-foreground)"
          maskColor="color-mix(in oklch, var(--background) 70%, transparent)"
        />
      </ReactFlow>
    </div>
  );
}
