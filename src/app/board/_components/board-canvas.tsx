"use client";

import { useCallback, useEffect, useMemo } from "react";

import {
  Background,
  BackgroundVariant,
  MarkerType,
  type ProOptions,
  ReactFlow,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useShallow } from "zustand/react/shallow";

import { FreehandNode, FreehandOverlay, SaveStatus, useDrawingUndoRedo, type FreehandNodeType } from "@/lib/canvas";
import { ZoomControls } from "@/components/react-flow";
import { cn } from "@/lib/utils";

import { useAutoSave } from "@/lib/canvas/hooks/use-auto-save";
import {
  type BoardEdge as BoardEdgeType,
  type BoardNode,
  type BoardStore,
  useBoardStore,
} from "../store/board-store";
import { BoardCanvasControls } from "./board-canvas-controls";
import { BoardEdge } from "./board-edge";
import { FrameNodeMemo } from "./frame-node";
import { FrameOverlay } from "./frame-overlay";
import { RoleDialog } from "./role-dialog";
import { RoleNodeMemo } from "./role-node-component";
import { TextNodeMemo } from "./text-node";

const nodeTypes = {
  "role-node": RoleNodeMemo,
  "text-node": TextNodeMemo,
  "frame-node": FrameNodeMemo,
  freehand: FreehandNode,
};

const edgeTypes = {
  "board-edge": BoardEdge,
};

const proOptions: ProOptions = { hideAttribution: true };

const selector = (state: BoardStore) => ({
  nodes: state.nodes,
  edges: state.edges,
  boardId: state.boardId,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  setNodes: state.setNodes,
  isDirty: state.isDirty,
  editingNodeId: state.editingNodeId,
  setEditingNodeId: state.setEditingNodeId,
  isDrawing: state.isDrawing,
  setIsDrawing: state.setIsDrawing,
  isFrameMode: state.isFrameMode,
  setIsFrameMode: state.setIsFrameMode,
  markDirty: state.markDirty,
  isInitialized: state.isInitialized,
});

function ReactFlowInstanceRegistrar() {
  const reactFlowInstance = useReactFlow<BoardNode, BoardEdgeType>();
  const setReactFlowInstance = useBoardStore(
    (state) => state.setReactFlowInstance,
  );

  useEffect(() => {
    setReactFlowInstance(reactFlowInstance);
    return () => setReactFlowInstance(null);
  }, [reactFlowInstance, setReactFlowInstance]);

  return null;
}

function BoardCanvasInner() {
  const {
    nodes,
    isDrawing,
    setIsDrawing,
    isFrameMode,
    setIsFrameMode,
    setNodes,
    addFrameNode,
    markDirty,
  } = useBoardStore(
    useShallow((state) => ({
      nodes: state.nodes,
      isDrawing: state.isDrawing,
      setIsDrawing: state.setIsDrawing,
      isFrameMode: state.isFrameMode,
      setIsFrameMode: state.setIsFrameMode,
      setNodes: state.setNodes,
      addFrameNode: state.addFrameNode,
      markDirty: state.markDirty,
    })),
  );

  const { undo, redo, takeSnapshot, canUndo, canRedo } =
    useDrawingUndoRedo<BoardNode>();

  const handleDrawingComplete = useCallback(
    (node: FreehandNodeType) => {
      takeSnapshot();
      setNodes([...nodes, node]);
    },
    [takeSnapshot, setNodes, nodes],
  );

  const handleFrameComplete = useCallback(
    (position: { x: number; y: number }, size: { width: number; height: number }) => {
      takeSnapshot();
      addFrameNode(position, size);
      setIsFrameMode(false);
      markDirty();
    },
    [takeSnapshot, addFrameNode, setIsFrameMode, markDirty],
  );

  const handleFrameCancel = useCallback(() => {
    setIsFrameMode(false);
  }, [setIsFrameMode]);

  return (
    <>
      <ZoomControls
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      <BoardCanvasControls
        isDrawing={isDrawing}
        setIsDrawing={setIsDrawing}
        isFrameMode={isFrameMode}
        setIsFrameMode={setIsFrameMode}
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        takeSnapshot={takeSnapshot}
      />
      <ReactFlowInstanceRegistrar />
      {isDrawing && (
        <FreehandOverlay onDrawingComplete={handleDrawingComplete} />
      )}
      {isFrameMode && (
        <FrameOverlay
          onFrameComplete={handleFrameComplete}
          onCancel={handleFrameCancel}
        />
      )}
    </>
  );
}

export function BoardCanvas() {
  const {
    nodes,
    edges,
    boardId,
    onNodesChange,
    onEdgesChange,
    onConnect,
    isDirty,
    editingNodeId,
    setEditingNodeId,
    isDrawing,
    isFrameMode,
  } = useBoardStore(useShallow(selector));

  const { isSaving, lastSaved } = useAutoSave();

  const selectedRole = useMemo(() => {
    if (!editingNodeId) return null;
    const node = nodes.find((n) => n.id === editingNodeId);
    if (!node || node.type !== "role-node") return null;
    return {
      ...node.data,
      nodeId: node.id,
    };
  }, [editingNodeId, nodes]);

  useEffect(() => {
    if (!selectedRole && editingNodeId) {
      setEditingNodeId(null);
    }
  }, [selectedRole, editingNodeId, setEditingNodeId]);

  return (
    <div className="relative h-full w-full">
      {/* Save Status Indicator */}
      <div className="absolute top-4 right-4 z-20">
        <SaveStatus
          isSaving={isSaving}
          isDirty={isDirty}
          lastSaved={lastSaved}
        />
      </div>

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={proOptions}
        fitView
        fitViewOptions={{
          maxZoom: 0.65,
          minZoom: 0.65,
        }}
        className={cn(
          "bg-background",
          "transition-opacity duration-200",
          isSaving && "opacity-90",
        )}
        panOnScroll={!isDrawing && !isFrameMode}
        panOnDrag={!isDrawing && !isFrameMode}
        zoomOnScroll={!isDrawing && !isFrameMode}
        selectNodesOnDrag={!isDrawing && !isFrameMode}
        defaultEdgeOptions={{
          type: "board-edge",
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <BoardCanvasInner />
      </ReactFlow>

      {/* Edit Role Dialog */}
      {selectedRole && (
        <RoleDialog
          boardId={boardId}
          roleData={selectedRole}
          open={!!editingNodeId}
          onOpenChange={(open) => {
            if (!open) setEditingNodeId(null);
          }}
        />
      )}
    </div>
  );
}

