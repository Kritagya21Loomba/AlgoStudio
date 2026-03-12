import type { Algorithm, AlgorithmStep } from '../types';
import type { AVLNodeData, AVLState, AVLInput, AVLTreeNodePosition } from './avl-types';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

let nodeCounter = 0;

function nextNodeId(): string {
  return `avl-${nodeCounter++}`;
}

function cloneNodes(nodes: AVLNodeData[]): AVLNodeData[] {
  return nodes.map((n) => ({ ...n }));
}

function findNode(nodes: AVLNodeData[], id: string): AVLNodeData | undefined {
  return nodes.find((n) => n.id === id);
}

function getHeight(nodes: AVLNodeData[], id: string | null): number {
  if (id === null) return 0;
  const node = findNode(nodes, id);
  return node ? node.height : 0;
}

function updateHeights(nodes: AVLNodeData[]): void {
  // Build map for fast lookup
  const map = new Map(nodes.map((n) => [n.id, n]));

  function computeHeight(id: string | null): number {
    if (id === null) return 0;
    const node = map.get(id)!;
    const lh = computeHeight(node.left);
    const rh = computeHeight(node.right);
    node.height = 1 + Math.max(lh, rh);
    node.balanceFactor = lh - rh;
    return node.height;
  }

  // Find root (a node that is nobody's child)
  const childIds = new Set<string>();
  for (const n of nodes) {
    if (n.left) childIds.add(n.left);
    if (n.right) childIds.add(n.right);
  }
  for (const n of nodes) {
    if (!childIds.has(n.id)) {
      computeHeight(n.id);
      break;
    }
  }
}

function getBalanceFactors(nodes: AVLNodeData[]): Record<string, number> {
  const bf: Record<string, number> = {};
  for (const n of nodes) bf[n.id] = n.balanceFactor;
  return bf;
}

// Layout: inorder x, depth y (same logic as layoutBST but returns AVLTreeNodePosition)
function layoutAVL(nodes: AVLNodeData[], rootId: string | null): AVLTreeNodePosition[] {
  if (nodes.length === 0 || rootId === null) return [];
  const map = new Map(nodes.map((n) => [n.id, n]));
  const inorderIds: string[] = [];
  const depthMap = new Map<string, number>();

  function inorder(id: string | null, depth: number): void {
    if (id === null) return;
    const node = map.get(id);
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
  const xDiv = total > 1 ? total - 1 : 1;
  const yDiv = maxDepth > 0 ? maxDepth : 1;

  return inorderIds.map((id, index) => {
    const node = map.get(id)!;
    return {
      id: node.id,
      value: node.value,
      x: total === 1 ? 0.5 : index / xDiv,
      y: depthMap.get(id)! / yDiv,
      height: node.height,
      balanceFactor: node.balanceFactor,
    };
  });
}

function computeEdges(nodes: AVLNodeData[]): { from: string; to: string }[] {
  const edges: { from: string; to: string }[] = [];
  for (const node of nodes) {
    if (node.left !== null) edges.push({ from: node.id, to: node.left });
    if (node.right !== null) edges.push({ from: node.id, to: node.right });
  }
  return edges;
}

function makeState(
  nodes: AVLNodeData[],
  rootId: string | null,
  overrides: Partial<AVLState>,
): AVLState {
  const positions = layoutAVL(nodes, rootId);
  const edges = computeEdges(nodes);
  return {
    nodes: positions,
    edges,
    current: null,
    highlightPath: [],
    justInserted: null,
    justDeleted: null,
    comparedValue: null,
    message: '',
    balanceFactors: getBalanceFactors(nodes),
    rotatingNodes: [],
    rotationType: null,
    unbalancedNode: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// AVL Rotations
// ---------------------------------------------------------------------------

function rotateRight(nodes: AVLNodeData[], zId: string): string {
  // z is unbalanced, y is z.left, T3 is y.right
  const z = findNode(nodes, zId)!;
  const yId = z.left!;
  const y = findNode(nodes, yId)!;
  const t3 = y.right;

  y.right = zId;
  z.left = t3;

  updateHeights(nodes);
  return yId; // new root of this subtree
}

function rotateLeft(nodes: AVLNodeData[], zId: string): string {
  const z = findNode(nodes, zId)!;
  const yId = z.right!;
  const y = findNode(nodes, yId)!;
  const t2 = y.left;

  y.left = zId;
  z.right = t2;

  updateHeights(nodes);
  return yId; // new root of this subtree
}

// Helper: replace child pointer in parent, or update rootId
function replaceChild(
  nodes: AVLNodeData[],
  parentId: string | null,
  oldChildId: string,
  newChildId: string,
  rootId: string,
): string {
  if (parentId === null) return newChildId; // new root
  const parent = findNode(nodes, parentId)!;
  if (parent.left === oldChildId) parent.left = newChildId;
  else if (parent.right === oldChildId) parent.right = newChildId;
  return rootId;
}

// ---------------------------------------------------------------------------
// AVL Algorithm
// ---------------------------------------------------------------------------

export const avl: Algorithm<AVLState, AVLInput> = {
  meta: {
    name: 'AVL Tree',
    slug: 'avl',
    category: 'tree',
    complexity: {
      time: { best: 'O(log n)', average: 'O(log n)', worst: 'O(log n)' },
      space: 'O(n)',
    },
    pseudocode: [
      'procedure AVL-Insert(root, value)',
      '  if root is null then',
      '    return new Node(value)',
      '  if value < root.value then',
      '    root.left <- Insert(root.left, value)',
      '  else if value > root.value then',
      '    root.right <- Insert(root.right, value)',
      '  update height and balance factor',
      '  if balance > 1 and value < left.value',
      '    return rightRotate(root)  // LL',
      '  if balance < -1 and value > right.value',
      '    return leftRotate(root)   // RR',
      '  if balance > 1 and value > left.value',
      '    leftRotate(root.left)     // LR',
      '    return rightRotate(root)',
      '  if balance < -1 and value < right.value',
      '    rightRotate(root.right)   // RL',
      '    return leftRotate(root)',
      '  return root',
    ],
  },

  generateSteps(input: AVLInput): AlgorithmStep<AVLState>[] {
    nodeCounter = 0;
    const steps: AlgorithmStep<AVLState>[] = [];
    let nodes: AVLNodeData[] = [];
    let rootId: string | null = null;

    steps.push({
      state: makeState([], null, { message: 'Starting with an empty AVL tree' }),
      activeLines: [0],
      description: 'Starting with an empty AVL tree',
      action: 'init',
    });

    for (const op of input.operations) {
      if (op.type === 'insert') {
        const value = op.value;

        if (rootId === null) {
          const newId = nextNodeId();
          nodes = [{ id: newId, value, left: null, right: null, height: 1, balanceFactor: 0 }];
          rootId = newId;
          steps.push({
            state: makeState(nodes, rootId, {
              justInserted: newId,
              comparedValue: value,
              message: `Insert ${value} as root`,
            }),
            activeLines: [0, 1, 2],
            description: `Insert ${value} as root node`,
            action: 'insert',
          });
          continue;
        }

        // Traverse to find insertion point, tracking ancestors for rebalancing
        let currentId: string | null = rootId;
        const path: string[] = [];
        const parentMap: Record<string, string | null> = {};

        while (currentId !== null) {
          const currentNode = findNode(nodes, currentId)!;
          path.push(currentId);

          steps.push({
            state: makeState(nodes, rootId, {
              current: currentId,
              highlightPath: [...path],
              comparedValue: value,
              message: `Compare ${value} with ${currentNode.value}`,
            }),
            activeLines: value < currentNode.value ? [3, 4] : [5, 6],
            description: `Compare ${value} with ${currentNode.value} — go ${value < currentNode.value ? 'left' : 'right'}`,
            action: 'compare',
          });

          if (value < currentNode.value) {
            if (currentNode.left === null) {
              const newId = nextNodeId();
              nodes = cloneNodes(nodes);
              const newNode: AVLNodeData = { id: newId, value, left: null, right: null, height: 1, balanceFactor: 0 };
              findNode(nodes, currentId)!.left = newId;
              nodes.push(newNode);
              updateHeights(nodes);
              parentMap[newId] = currentId;

              steps.push({
                state: makeState(nodes, rootId, {
                  justInserted: newId,
                  highlightPath: [...path, newId],
                  comparedValue: value,
                  message: `Insert ${value} as left child of ${currentNode.value}`,
                }),
                activeLines: [1, 2],
                description: `Insert ${value} as left child of ${currentNode.value}`,
                action: 'insert',
              });
              break;
            } else {
              parentMap[currentNode.left] = currentId;
              currentId = currentNode.left;
            }
          } else if (value > currentNode.value) {
            if (currentNode.right === null) {
              const newId = nextNodeId();
              nodes = cloneNodes(nodes);
              const newNode: AVLNodeData = { id: newId, value, left: null, right: null, height: 1, balanceFactor: 0 };
              findNode(nodes, currentId)!.right = newId;
              nodes.push(newNode);
              updateHeights(nodes);
              parentMap[newId] = currentId;

              steps.push({
                state: makeState(nodes, rootId, {
                  justInserted: newId,
                  highlightPath: [...path, newId],
                  comparedValue: value,
                  message: `Insert ${value} as right child of ${currentNode.value}`,
                }),
                activeLines: [1, 2],
                description: `Insert ${value} as right child of ${currentNode.value}`,
                action: 'insert',
              });
              break;
            } else {
              parentMap[currentNode.right] = currentId;
              currentId = currentNode.right;
            }
          } else {
            steps.push({
              state: makeState(nodes, rootId, {
                current: currentId,
                highlightPath: [...path],
                comparedValue: value,
                message: `Value ${value} already exists — skipping`,
              }),
              activeLines: [18],
              description: `Value ${value} already exists — skipping`,
              action: 'compare',
            });
            break;
          }
        }

        // Build parent chain for all nodes
        const nodeParent: Record<string, string | null> = {};
        function buildParentMap(id: string | null, parent: string | null) {
          if (!id) return;
          nodeParent[id] = parent;
          const n = findNode(nodes, id);
          if (n) {
            buildParentMap(n.left, id);
            buildParentMap(n.right, id);
          }
        }
        buildParentMap(rootId, null);

        // Walk back up the insertion path checking balance
        for (let i = path.length - 1; i >= 0; i--) {
          const nodeId = path[i];
          const node = findNode(nodes, nodeId);
          if (!node) continue;

          updateHeights(nodes);
          const bf = node.balanceFactor;

          steps.push({
            state: makeState(nodes, rootId, {
              current: nodeId,
              highlightPath: path.slice(0, i + 1),
              message: `Check balance of ${node.value}: balance = ${bf}`,
              unbalancedNode: Math.abs(bf) > 1 ? nodeId : null,
            }),
            activeLines: [7],
            description: `Balance factor of ${node.value} is ${bf}${Math.abs(bf) > 1 ? ' — UNBALANCED!' : ' — OK'}`,
            action: 'balance-check',
          });

          if (Math.abs(bf) <= 1) continue;

          // Need rotation
          nodes = cloneNodes(nodes);
          const parentId = nodeParent[nodeId] || null;

          if (bf > 1 && getHeight(nodes, findNode(nodes, node.left!)?.left ?? null) >= getHeight(nodes, findNode(nodes, node.left!)?.right ?? null)) {
            // LL case — right rotation
            steps.push({
              state: makeState(nodes, rootId, {
                current: nodeId,
                rotatingNodes: [nodeId, node.left!],
                rotationType: 'LL',
                unbalancedNode: nodeId,
                message: `LL case at ${node.value} — Right Rotation`,
              }),
              activeLines: [8, 9],
              description: `LL imbalance at ${node.value} — performing right rotation`,
              action: 'rotate-right',
            });

            const newSubRoot = rotateRight(nodes, nodeId);
            rootId = replaceChild(nodes, parentId, nodeId, newSubRoot, rootId!);
            updateHeights(nodes);

            steps.push({
              state: makeState(nodes, rootId, {
                message: `Right rotation complete — tree rebalanced`,
              }),
              activeLines: [9],
              description: `Right rotation at ${node.value} complete`,
              action: 'balance-check',
            });
          } else if (bf < -1 && getHeight(nodes, findNode(nodes, node.right!)?.right ?? null) >= getHeight(nodes, findNode(nodes, node.right!)?.left ?? null)) {
            // RR case — left rotation
            steps.push({
              state: makeState(nodes, rootId, {
                current: nodeId,
                rotatingNodes: [nodeId, node.right!],
                rotationType: 'RR',
                unbalancedNode: nodeId,
                message: `RR case at ${node.value} — Left Rotation`,
              }),
              activeLines: [10, 11],
              description: `RR imbalance at ${node.value} — performing left rotation`,
              action: 'rotate-left',
            });

            const newSubRoot = rotateLeft(nodes, nodeId);
            rootId = replaceChild(nodes, parentId, nodeId, newSubRoot, rootId!);
            updateHeights(nodes);

            steps.push({
              state: makeState(nodes, rootId, {
                message: `Left rotation complete — tree rebalanced`,
              }),
              activeLines: [11],
              description: `Left rotation at ${node.value} complete`,
              action: 'balance-check',
            });
          } else if (bf > 1) {
            // LR case — left rotate left child, then right rotate
            const leftChild = node.left!;
            steps.push({
              state: makeState(nodes, rootId, {
                current: nodeId,
                rotatingNodes: [nodeId, leftChild],
                rotationType: 'LR',
                unbalancedNode: nodeId,
                message: `LR case at ${node.value} — Left-Right Rotation`,
              }),
              activeLines: [12, 13],
              description: `LR imbalance at ${node.value} — first: left rotate left child`,
              action: 'rotate-left',
            });

            const newLeft = rotateLeft(nodes, leftChild);
            findNode(nodes, nodeId)!.left = newLeft;
            updateHeights(nodes);

            steps.push({
              state: makeState(nodes, rootId, {
                current: nodeId,
                rotatingNodes: [nodeId, newLeft],
                rotationType: 'LR',
                message: `LR step 2: Right rotate at ${node.value}`,
              }),
              activeLines: [14],
              description: `LR step 2: right rotate at ${node.value}`,
              action: 'rotate-right',
            });

            const newSubRoot = rotateRight(nodes, nodeId);
            rootId = replaceChild(nodes, parentId, nodeId, newSubRoot, rootId!);
            updateHeights(nodes);

            steps.push({
              state: makeState(nodes, rootId, {
                message: `LR rotation complete — tree rebalanced`,
              }),
              activeLines: [14],
              description: `Left-Right rotation complete`,
              action: 'balance-check',
            });
          } else {
            // RL case — right rotate right child, then left rotate
            const rightChild = node.right!;
            steps.push({
              state: makeState(nodes, rootId, {
                current: nodeId,
                rotatingNodes: [nodeId, rightChild],
                rotationType: 'RL',
                unbalancedNode: nodeId,
                message: `RL case at ${node.value} — Right-Left Rotation`,
              }),
              activeLines: [15, 16],
              description: `RL imbalance at ${node.value} — first: right rotate right child`,
              action: 'rotate-right',
            });

            const newRight = rotateRight(nodes, rightChild);
            findNode(nodes, nodeId)!.right = newRight;
            updateHeights(nodes);

            steps.push({
              state: makeState(nodes, rootId, {
                current: nodeId,
                rotatingNodes: [nodeId, newRight],
                rotationType: 'RL',
                message: `RL step 2: Left rotate at ${node.value}`,
              }),
              activeLines: [17],
              description: `RL step 2: left rotate at ${node.value}`,
              action: 'rotate-left',
            });

            const newSubRoot = rotateLeft(nodes, nodeId);
            rootId = replaceChild(nodes, parentId, nodeId, newSubRoot, rootId!);
            updateHeights(nodes);

            steps.push({
              state: makeState(nodes, rootId, {
                message: `RL rotation complete — tree rebalanced`,
              }),
              activeLines: [17],
              description: `Right-Left rotation complete`,
              action: 'balance-check',
            });
          }

          // Rebuild parent map after rotation
          buildParentMap(rootId, null);
          break; // Only one rebalance needed per insertion in AVL
        }
      }
    }

    steps.push({
      state: makeState(nodes, rootId, { message: 'All operations complete' }),
      activeLines: [],
      description: 'All AVL operations complete',
      action: 'done',
    });

    return steps;
  },
};

// Default operations: triggers all 4 rotation types
export const DEFAULT_AVL_OPERATIONS = [
  { type: 'insert' as const, value: 30 },
  { type: 'insert' as const, value: 20 },
  { type: 'insert' as const, value: 10 }, // Triggers LL (right rotation at 30)
  { type: 'insert' as const, value: 25 }, // LR trigger setup
  { type: 'insert' as const, value: 40 },
  { type: 'insert' as const, value: 50 }, // Triggers RR (left rotation at 40)
  { type: 'insert' as const, value: 35 }, // Triggers RL at some point
];
