"use client";

import { BoardCanvasWrapper } from "./board-canvas-wrapper";
import { CombinedSidebar } from "./combined-sidebar";
import { type StoredEdge, type StoredNode } from "../types/canvas";

// Mock initial data
const mockNodes: StoredNode[] = [
  {
    id: "role-1",
    type: "role-node",
    position: { x: 250, y: 100 },
    data: {
      roleId: "role-1",
      title: "Product Manager",
      purpose: "Define product vision and roadmap",
      color: "#3b82f6",
      assignedUserName: "John Doe",
      effortPoints: 5,
    },
  },
  {
    id: "role-2",
    type: "role-node",
    position: { x: 600, y: 100 },
    data: {
      roleId: "role-2",
      title: "Engineering Lead",
      purpose: "Lead the engineering team and technical decisions",
      color: "#10b981",
      assignedUserName: "Jane Smith",
      effortPoints: 8,
    },
  },
  {
    id: "role-3",
    type: "role-node",
    position: { x: 250, y: 350 },
    data: {
      roleId: "role-3",
      title: "Design Lead",
      purpose: "Create user experiences and design systems",
      color: "#f59e0b",
      assignedUserName: "Alice Johnson",
      effortPoints: 6,
    },
  },
];

const mockEdges: StoredEdge[] = [
  {
    id: "edge-1",
    source: "role-1",
    target: "role-2",
    type: "board-edge",
    animated: true,
  },
  {
    id: "edge-2",
    source: "role-1",
    target: "role-3",
    type: "board-edge",
    animated: true,
  },
];

export function BoardPageContent() {
  const boardId = "demo-board";
  const boardName = "Demo Board";

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Left Sidebar - Combined Roles & KPIs */}
      <CombinedSidebar
        boardId={boardId}
        boardName={boardName}
        boardDescription={null}
        roleCount={mockNodes.filter((n) => n.type === "role-node").length}
      />

      {/* Main Canvas Area */}
      <div className="relative h-full w-full flex-1 overflow-hidden">
        <BoardCanvasWrapper
          initialNodes={mockNodes}
          initialEdges={mockEdges}
          boardId={boardId}
          shareToken={null}
          isPubliclyShared={false}
        />
      </div>
    </div>
  );
}



