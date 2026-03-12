export type RBColor = 'red' | 'black';

export interface RBNodeData {
  id: string;
  value: number;
  left: string | null;
  right: string | null;
  parent: string | null;
  color: RBColor;
}

export interface RBOperation {
  type: 'insert';
  value: number;
}

export interface RBInput {
  operations: RBOperation[];
}

export interface RBTreeNodePosition {
  id: string;
  value: number;
  x: number;
  y: number;
  color: RBColor;
}

export interface RBState {
  nodes: RBTreeNodePosition[];
  edges: { from: string; to: string }[];
  current: string | null;
  highlightPath: string[];
  justInserted: string | null;
  recoloredNodes: string[];
  rotatingNodes: string[];
  rotationType: 'left' | 'right' | null;
  message: string;
}
