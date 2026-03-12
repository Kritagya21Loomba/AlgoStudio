export interface AVLNodeData {
  id: string;
  value: number;
  left: string | null;
  right: string | null;
  height: number;
  balanceFactor: number;
}

export interface AVLOperation {
  type: 'insert' | 'delete';
  value: number;
}

export interface AVLInput {
  operations: AVLOperation[];
}

export interface AVLTreeNodePosition {
  id: string;
  value: number;
  x: number;
  y: number;
  height: number;
  balanceFactor: number;
}

export interface AVLState {
  nodes: AVLTreeNodePosition[];
  edges: { from: string; to: string }[];
  current: string | null;
  highlightPath: string[];
  justInserted: string | null;
  justDeleted: string | null;
  comparedValue: number | null;
  message: string;
  balanceFactors: Record<string, number>;
  rotatingNodes: string[];
  rotationType: 'LL' | 'RR' | 'LR' | 'RL' | null;
  unbalancedNode: string | null;
}
