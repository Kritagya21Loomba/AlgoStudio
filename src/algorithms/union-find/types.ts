export interface UFNodePosition {
  id: number;
  x: number;
  y: number;
  rank: number;
  parent: number;
  setColor: string;
}

export interface UFEdge {
  from: number;
  to: number;
}

export interface UnionFindState {
  parent: number[];
  rank: number[];
  nodes: UFNodePosition[];
  edges: UFEdge[];
  highlightedNodes: number[];
  compressingFrom: number | null;
  compressingTo: number | null;
  setColors: Record<number, string>;
  justUnioned: [number, number] | null;
  message: string;
}

export interface UFOperation {
  type: 'find' | 'union';
  args: [number] | [number, number];
}

export interface UnionFindInput {
  n: number;
  operations: UFOperation[];
}
