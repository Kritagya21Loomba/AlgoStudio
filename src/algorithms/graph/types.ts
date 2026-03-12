export interface GraphNode {
  id: string;
  label: string;
  x: number;  // 0-1 normalized coordinates
  y: number;
}

export interface GraphEdge {
  from: string;
  to: string;
}

export interface GraphInput {
  nodes: GraphNode[];
  edges: GraphEdge[];
  startNodeId: string;
  directed?: boolean;
}

export interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  visited: string[];           // fully processed nodes
  current: string | null;      // node being visited right now
  frontier: string[];          // queue (BFS) or stack (DFS) contents
  currentEdge: [string, string] | null;  // edge being traversed [from, to]
  discoveryOrder: string[];    // order nodes were first discovered
}
