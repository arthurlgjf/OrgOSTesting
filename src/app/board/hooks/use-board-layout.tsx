import { useCallback } from "react";

import { useShallow } from "zustand/react/shallow";

import { type BoardStore, useBoardStore } from "../store/board-store";
import { layoutBoardWithForce } from "../utils/force-layout";

const selector = (state: BoardStore) => ({
  nodes: state.nodes,
  edges: state.edges,
  setNodes: state.setNodes,
  markDirty: state.markDirty,
});

/**
 * Hook to trigger force-directed layout of board canvas nodes
 * Uses d3-force to arrange nodes with physics-based positioning
 */
export function useBoardLayout() {
  const { nodes, edges, setNodes, markDirty } = useBoardStore(useShallow(selector));

  return useCallback(() => {
    const layoutedNodes = layoutBoardWithForce(nodes, edges);
    setNodes(layoutedNodes);
    markDirty();
  }, [edges, nodes, setNodes, markDirty]);
}

