export interface SegTreeNodeData {
  index: number;       // position in the flat array (1-indexed)
  value: number;       // sum/aggregate value at this node
  rangeL: number;      // left bound of range this node covers
  rangeR: number;      // right bound of range this node covers
  x: number;           // layout x (0-1 normalized)
  y: number;           // layout y (0-1 normalized)
}

export interface SegTreeState {
  tree: SegTreeNodeData[];
  baseArray: number[];
  highlightedNodes: number[];   // indices currently being visited
  updatedNode: number | null;   // index of node being updated
  queryRange: [number, number] | null;
  queryResult: number | null;
  message: string;
}

export interface SegTreeOperation {
  type: 'build' | 'query' | 'update';
  queryL?: number;
  queryR?: number;
  updateIdx?: number;
  updateVal?: number;
}

export interface SegTreeInput {
  baseArray: number[];
  operations: SegTreeOperation[];
}
