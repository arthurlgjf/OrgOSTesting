"use client";

import { useCallback } from "react";

import {
  BaseEdge,
  type Edge,
  type EdgeProps,
  MarkerType,
  getBezierPath,
} from "@xyflow/react";
import { nanoid } from "nanoid";

import { EdgeActionButtons } from "@/lib/canvas";

import { useBoardStore, useBoardStoreApi } from "../store/board-store";
import { calculateBusFactorRisk } from "../utils/bus-factor";
import { type RoleNodeData } from "./role-node";

export type BoardEdge = Edge;

export function BoardEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  source: _source,
  target: _target,
  style = {},
  markerEnd,
  selected,
}: EdgeProps<BoardEdge>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const storeApi = useBoardStoreApi();
  const boardId = useBoardStore((state) => state.boardId);
  const nodes = useBoardStore((state) => state.nodes);
  const edges = useBoardStore((state) => state.edges);
  const setNodes = useBoardStore((state) => state.setNodes);
  const setEdges = useBoardStore((state) => state.setEdges);
  const markDirty = useBoardStore((state) => state.markDirty);

  // Calculate bus factor risk
  const { riskyEdges } = calculateBusFactorRisk(nodes, edges);
  const isRisky = riskyEdges.has(id);

  const handleAddRole = useCallback(() => {
    const nodeId = `role-node-${nanoid(8)}`;
    // Create a new role node at the edge midpoint
    const position = { x: labelX - 140, y: labelY - 50 };
    
    const newNode = {
      id: nodeId,
      type: "role-node" as const,
      position,
      data: {
        roleId: `role-${nanoid(8)}`,
        title: "New Role",
        purpose: "Define the purpose of this role",
        color: "#3b82f6",
      } as RoleNodeData,
    };

    const currentNodes = storeApi.getState().nodes;
    const currentEdges = storeApi.getState().edges;
    
    // Remove the old edge and add two new edges
    const edgeIndex = currentEdges.findIndex((e) => e.id === id);
    const edge = currentEdges[edgeIndex];
    if (!edge) return;

    const newEdges = [
      ...currentEdges.slice(0, edgeIndex),
      ...currentEdges.slice(edgeIndex + 1),
      {
        id: `edge-${edge.source}-${nodeId}`,
        source: edge.source,
        target: nodeId,
        type: "board-edge",
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
      },
      {
        id: `edge-${nodeId}-${edge.target}`,
        source: nodeId,
        target: edge.target,
        type: "board-edge",
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
      },
    ];

    setNodes([...currentNodes, newNode]);
    setEdges(newEdges);
    markDirty();
  }, [storeApi, id, labelX, labelY, setNodes, setEdges, markDirty]);

  const handleDeleteEdge = useCallback(() => {
    const currentEdges = storeApi.getState().edges;
    const newEdges = currentEdges.filter((e) => e.id !== id);
    setEdges(newEdges);
    markDirty();
  }, [storeApi, id, setEdges, markDirty]);

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 2 : 1.5,
          stroke: isRisky ? "#ef4444" : style.stroke,
          pointerEvents: "auto",
        }}
      />
      <EdgeActionButtons
        labelX={labelX}
        labelY={labelY}
        selected={selected}
        onAdd={handleAddRole}
        onDelete={handleDeleteEdge}
        isAdding={false}
        addTitle="Add role between"
      />
    </>
  );
}

