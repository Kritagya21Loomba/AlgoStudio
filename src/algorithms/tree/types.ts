export interface BSTNodeData {
  id: string;
  value: number;
  left: string | null;   // child node ID
  right: string | null;  // child node ID
}

export interface TreeNodePosition {
  id: string;
  value: number;
  x: number;   // computed by layout
  y: number;
}

export interface BSTOperation {
  type: 'insert' | 'delete';
  value: number;
}

export interface BSTInput {
  operations: BSTOperation[];
}

export interface BSTState {
  nodes: TreeNodePosition[];
  edges: { from: string; to: string }[];
  current: string | null;        // node being examined
  highlightPath: string[];       // path from root to current
  justInserted: string | null;   // newly inserted node
  justDeleted: string | null;    // node being deleted
  comparedValue: number | null;  // value we're searching for
  message: string;               // description text (available for overlay)
}
