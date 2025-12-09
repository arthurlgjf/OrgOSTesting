"use client";

import { type ReactNode, createContext, useContext, useRef } from "react";

import {
  type Edge,
  MarkerType,
  type Node,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  type ReactFlowInstance,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from "@xyflow/react";
import { nanoid } from "nanoid";
import { type StoreApi, create, useStore } from "zustand";

import { type FreehandNodeType, type Points } from "@/lib/canvas/types";

import { type RoleNodeData } from "../_components/role-node";
import { type FrameNodeData } from "../_components/frame-node";
import { type TextNodeFontSize } from "../types/canvas";

// Text node data type
export type TextNodeData = {
  text: string;
  fontSize?: TextNodeFontSize;
};

export type TextNode = Node<TextNodeData, "text-node">;
export type RoleNode = Node<RoleNodeData, "role-node">;
export type FrameNode = Node<FrameNodeData, "frame-node">;
export type BoardNode = RoleNode | TextNode | FrameNode | FreehandNodeType;
export type BoardEdge = Edge;

type BoardState = {
  // React Flow state
  nodes: BoardNode[];
  edges: BoardEdge[];
  reactFlowInstance: ReactFlowInstance<BoardNode, BoardEdge> | null;

  // Board metadata
  boardId: string;
  boardName: string;

  // UI state
  isDirty: boolean;
  lastSaved: Date | null;
  isSaving: boolean;
  isInitialized: boolean;
  editingNodeId: string | null;
  editingTextNodeId: string | null;
  isDrawing: boolean;
  isFrameMode: boolean;
};

type BoardActions = {
  // React Flow actions
  onNodesChange: OnNodesChange<BoardNode>;
  onEdgesChange: OnEdgesChange<BoardEdge>;
  onConnect: OnConnect;

  // State setters
  setNodes: (nodes: BoardNode[]) => void;
  setEdges: (edges: BoardEdge[]) => void;
  setBoardName: (name: string) => void;
  setReactFlowInstance: (
    instance: ReactFlowInstance<BoardNode, BoardEdge> | null,
  ) => void;

  // Dirty state management
  markDirty: () => void;
  markClean: () => void;
  setInitialized: (initialized: boolean) => void;

  // Saving state
  setSaving: (saving: boolean) => void;
  setLastSaved: (date: Date) => void;

  // Edit dialog (for role nodes)
  setEditingNodeId: (nodeId: string | null) => void;

  // Text node actions
  setEditingTextNodeId: (nodeId: string | null) => void;
  addTextNode: (position: { x: number; y: number }, text?: string) => string;
  updateTextNodeContent: (nodeId: string, text: string) => void;
  updateTextNodeFontSize: (nodeId: string, fontSize: TextNodeFontSize) => void;
  deleteNode: (nodeId: string) => void;

  // Frame node actions
  addFrameNode: (
    position: { x: number; y: number },
    size: { width: number; height: number },
    label?: string,
  ) => string;

  // Drawing mode
  setIsDrawing: (isDrawing: boolean) => void;
  setIsFrameMode: (isFrameMode: boolean) => void;
};

export type BoardStore = BoardState & BoardActions;

export function createBoardStore(
  initialBoardId: string,
  initialBoardName: string,
) {
  return create<BoardStore>()((set, get) => ({
    // Initial state
    nodes: [],
    edges: [],
    reactFlowInstance: null,
    boardId: initialBoardId,
    boardName: initialBoardName,
    isDirty: false,
    lastSaved: null,
    isSaving: false,
    isInitialized: false,
    editingNodeId: null,
    editingTextNodeId: null,
    isDrawing: false,
    isFrameMode: false,

    onNodesChange: (changes) => {
      const currentNodes = get().nodes;
      const nextNodes = applyNodeChanges(changes, currentNodes);
      set({ nodes: nextNodes });

      if (get().isInitialized) {
        // Skip marking dirty for freehand-only changes (drawings are session-only)
        const onlyFreehandChanges = changes.every((change) => {
          if ("id" in change) {
            const node =
              currentNodes.find((n) => n.id === change.id) ??
              nextNodes.find((n) => n.id === change.id);
            return node?.type === "freehand";
          }
          return false;
        });

        if (!onlyFreehandChanges) {
          get().markDirty();
        }
      }
    },

    onEdgesChange: (changes) => {
      const nextEdges = applyEdgeChanges(changes, get().edges);
      set({ edges: nextEdges });
      // Only mark dirty if initialized
      if (get().isInitialized) {
        get().markDirty();
      }
    },

    onConnect: (connection) => {
      const nextEdges = addEdge(
        {
          ...connection,
          type: "board-edge",
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        },
        get().edges,
      );
      set({ edges: nextEdges });
      // Only mark dirty if initialized
      if (get().isInitialized) {
        get().markDirty();
      }
    },

    // State setters
    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),
    setBoardName: (name) => {
      set({ boardName: name });
      get().markDirty();
    },
    setReactFlowInstance: (instance) => set({ reactFlowInstance: instance }),

    // Dirty state management
    markDirty: () => set({ isDirty: true }),
    markClean: () => set({ isDirty: false }),
    setInitialized: (initialized) => set({ isInitialized: initialized }),

    // Saving state
    setSaving: (saving) => set({ isSaving: saving }),
    setLastSaved: (date) => set({ lastSaved: date }),

    // Edit dialog (for role nodes)
    setEditingNodeId: (nodeId) => set({ editingNodeId: nodeId }),

    // Text node actions
    setEditingTextNodeId: (nodeId) => set({ editingTextNodeId: nodeId }),

    addTextNode: (position, text = "") => {
      const nodeId = `text-${nanoid(8)}`;
      const newNode: TextNode = {
        id: nodeId,
        type: "text-node",
        position,
        data: { text, fontSize: "medium" },
        style: { width: 180, height: 60 }, // Initial size for resizable node
      };
      set({ nodes: [...get().nodes, newNode] });
      if (get().isInitialized) {
        get().markDirty();
      }
      return nodeId;
    },

    updateTextNodeContent: (nodeId, text) => {
      set({
        nodes: get().nodes.map((node) =>
          node.id === nodeId && node.type === "text-node"
            ? { ...node, data: { ...node.data, text } }
            : node,
        ),
      });
      if (get().isInitialized) {
        get().markDirty();
      }
    },

    updateTextNodeFontSize: (nodeId, fontSize) => {
      set({
        nodes: get().nodes.map((node) =>
          node.id === nodeId && node.type === "text-node"
            ? { ...node, data: { ...node.data, fontSize } }
            : node,
        ),
      });
      if (get().isInitialized) {
        get().markDirty();
      }
    },

    deleteNode: (nodeId) => {
      set({
        nodes: get().nodes.filter((n) => n.id !== nodeId),
        edges: get().edges.filter(
          (e) => e.source !== nodeId && e.target !== nodeId,
        ),
      });
      if (get().isInitialized) {
        get().markDirty();
      }
    },

    // Frame node actions
    addFrameNode: (position, size, label = "Frame") => {
      const nodeId = `frame-${nanoid(8)}`;
      const newNode: FrameNode = {
        id: nodeId,
        type: "frame-node",
        position,
        data: { label, color: "#e5e7eb" },
        style: { width: size.width, height: size.height },
      };
      set({ nodes: [...get().nodes, newNode] });
      if (get().isInitialized) {
        get().markDirty();
      }
      return nodeId;
    },

    // Drawing mode
    setIsDrawing: (isDrawing) => set({ isDrawing }),
    setIsFrameMode: (isFrameMode) => set({ isFrameMode }),
  }));
}

// Context for the store
const BoardStoreContext = createContext<StoreApi<BoardStore> | null>(null);

export function BoardStoreProvider({
  children,
  boardId,
  boardName,
}: {
  children: ReactNode;
  boardId: string;
  boardName: string;
}) {
  const storeRef = useRef<StoreApi<BoardStore> | null>(null);

  storeRef.current ??= createBoardStore(boardId, boardName);

  return (
    <BoardStoreContext.Provider value={storeRef.current}>
      {children}
    </BoardStoreContext.Provider>
  );
}

export function useBoardStore<T>(selector: (state: BoardStore) => T): T {
  const store = useContext(BoardStoreContext);

  if (!store) {
    throw new Error("useBoardStore must be used within BoardStoreProvider");
  }

  return useStore(store, selector);
}

/**
 * Hook to get direct access to the store API for imperative state access
 */
export function useBoardStoreApi() {
  const store = useContext(BoardStoreContext);

  if (!store) {
    throw new Error("useBoardStoreApi must be used within BoardStoreProvider");
  }

  return store;
}

