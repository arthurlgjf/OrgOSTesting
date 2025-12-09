"use client";

import React, { useEffect } from "react";

import { type BoardNode, useBoardStore } from "../store/board-store";
import { type StoredEdge } from "../types/canvas";
import { BoardCanvas } from "./board-canvas";
import { ShareBoardDialog } from "./share-board-dialog";

// Helper to convert stored nodes to board nodes
function enrichNodesWithRoleData(
  storedNodes: any[],
): BoardNode[] {
  return storedNodes.map((node) => ({
    ...node,
    data: node.data || {},
  }));
}

interface BoardCanvasWrapperProps {
  initialNodes: BoardNode[];
  initialEdges: StoredEdge[];
  boardId: string;
  shareToken: string | null;
  isPubliclyShared: boolean;
}

export function BoardCanvasWrapper({
  initialNodes,
  initialEdges,
  boardId,
  shareToken,
  isPubliclyShared,
}: BoardCanvasWrapperProps) {
  const setNodes = useBoardStore((state) => state.setNodes);
  const setEdges = useBoardStore((state) => state.setEdges);
  const setInitialized = useBoardStore((state) => state.setInitialized);

  useEffect(() => {
    const enrichedNodes = enrichNodesWithRoleData(initialNodes);
    setNodes(enrichedNodes);
    setEdges(initialEdges);

    // Delay initialization to let React Flow complete setup without triggering dirty flag
    const timer = setTimeout(() => {
      setInitialized(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [initialNodes, initialEdges, setNodes, setEdges, setInitialized]);

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-4 left-4 z-20">
        <ShareBoardDialog
          boardId={boardId}
          initialShareToken={shareToken}
          initialIsPubliclyShared={isPubliclyShared}
        />
      </div>

      <BoardCanvas />
    </div>
  );
}

