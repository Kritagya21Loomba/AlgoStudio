import type { BSTNodeData, TreeNodePosition } from '../algorithms/tree/types';

/**
 * Compute x,y positions for every node in a BST using inorder traversal
 * for x-coordinates and depth for y-coordinates.
 *
 * Returns positions normalized to [0, 1] range.
 */
export function layoutBST(
  nodes: BSTNodeData[],
  rootId: string | null,
): TreeNodePosition[] {
  if (nodes.length === 0 || rootId === null) return [];

  const nodeMap = new Map<string, BSTNodeData>();
  for (const n of nodes) {
    nodeMap.set(n.id, n);
  }

  // Inorder traversal to assign x-indices
  const inorderIds: string[] = [];
  const depthMap = new Map<string, number>();

  function inorder(id: string | null, depth: number): void {
    if (id === null) return;
    const node = nodeMap.get(id);
    if (!node) return;

    inorder(node.left, depth + 1);
    inorderIds.push(id);
    depthMap.set(id, depth);
    inorder(node.right, depth + 1);
  }

  inorder(rootId, 0);

  const total = inorderIds.length;
  let maxDepth = 0;
  for (const d of depthMap.values()) {
    if (d > maxDepth) maxDepth = d;
  }

  // Avoid division by zero when there is only one node or all at same depth
  const xDivisor = total > 1 ? total - 1 : 1;
  const yDivisor = maxDepth > 0 ? maxDepth : 1;

  return inorderIds.map((id, index) => {
    const node = nodeMap.get(id)!;
    return {
      id: node.id,
      value: node.value,
      x: total === 1 ? 0.5 : index / xDivisor,
      y: depthMap.get(id)! / yDivisor,
    };
  });
}

/**
 * Compute the parent-child edges from the BST node data.
 */
export function computeEdges(
  nodes: BSTNodeData[],
): { from: string; to: string }[] {
  const edges: { from: string; to: string }[] = [];

  for (const node of nodes) {
    if (node.left !== null) {
      edges.push({ from: node.id, to: node.left });
    }
    if (node.right !== null) {
      edges.push({ from: node.id, to: node.right });
    }
  }

  return edges;
}
