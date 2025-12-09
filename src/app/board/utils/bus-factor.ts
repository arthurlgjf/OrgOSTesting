import type { Edge, Node } from "@xyflow/react";
import type { RoleNodeData } from "../_components/role-node";
import type { BoardEdge, BoardNode } from "../store/board-store";

/**
 * Calculate bus factor risk for roles
 * A role is considered at risk if:
 * 1. It has too many connections (overloaded) - regardless of key role status
 * 
 * Note: Key roles are tracked separately but don't automatically get the red triangle indicator.
 * The red triangle is only for overloaded roles (too many connections).
 * 
 * @param nodes - All nodes on the canvas
 * @param edges - All edges on the canvas
 * @param maxConnections - Maximum number of connections before a role is considered overloaded (default: 4)
 * @returns Object with:
 *   - atRiskRoleIds: Set of node IDs that are overloaded (too many connections)
 *   - riskyEdges: Set of edge IDs that connect to overloaded roles
 */
export function calculateBusFactorRisk(
  nodes: BoardNode[],
  edges: BoardEdge[],
  maxConnections: number = 4,
): {
  atRiskRoleIds: Set<string>;
  riskyEdges: Set<string>;
} {
  const atRiskRoleIds = new Set<string>();
  const riskyEdges = new Set<string>();

  // Get all role nodes
  const roleNodes = nodes.filter(
    (node): node is Node<RoleNodeData, "role-node"> =>
      node.type === "role-node",
  );

  // Calculate connection count for each role
  const connectionCounts = new Map<string, number>();
  roleNodes.forEach((node) => {
    connectionCounts.set(node.id, 0);
  });

  edges.forEach((edge) => {
    const sourceCount = connectionCounts.get(edge.source) ?? 0;
    const targetCount = connectionCounts.get(edge.target) ?? 0;
    connectionCounts.set(edge.source, sourceCount + 1);
    connectionCounts.set(edge.target, targetCount + 1);
  });

  // Identify overloaded roles (only based on connection count, not key role status)
  roleNodes.forEach((node) => {
    const connectionCount = connectionCounts.get(node.id) ?? 0;
    const isOverloaded = connectionCount > maxConnections;

    if (isOverloaded) {
      atRiskRoleIds.add(node.id);
    }
  });

  // Identify risky edges (edges connected to overloaded roles)
  edges.forEach((edge) => {
    if (
      atRiskRoleIds.has(edge.source) ||
      atRiskRoleIds.has(edge.target)
    ) {
      riskyEdges.add(edge.id);
    }
  });

  return { atRiskRoleIds, riskyEdges };
}

