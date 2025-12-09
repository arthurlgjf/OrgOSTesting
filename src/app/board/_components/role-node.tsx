import type { Node } from "@xyflow/react";

// Re-export shared types
export type { StoredEdge, TextNodeFontSize } from "../types/canvas";
export { FONT_SIZE_VALUES } from "../types/canvas";

/**
 * Role node data type
 */
export type RoleNodeData = {
  roleId: string;
  title: string;
  purpose: string;
  accountabilities?: string;
  metricId?: string;
  metricName?: string;
  metricValue?: number;
  metricUnit?: string;
  assignedUserId?: string | null;
  assignedUserName?: string;
  effortPoints?: number | null;
  color?: string;
  isPending?: boolean;
  isKeyRole?: boolean;
};

export type RoleNode = Node<RoleNodeData, "role-node">;

