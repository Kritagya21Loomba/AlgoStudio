import type { Algorithm, AlgorithmStep } from '../types';
import type { BSTNodeData, BSTState, BSTInput } from './types';
import { layoutBST, computeEdges } from '../../lib/tree-layout';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

let nodeCounter = 0;

function nextNodeId(): string {
  return `node-${nodeCounter++}`;
}

function cloneNodes(nodes: BSTNodeData[]): BSTNodeData[] {
  return nodes.map((n) => ({ ...n }));
}

function findNode(nodes: BSTNodeData[], id: string): BSTNodeData | undefined {
  return nodes.find((n) => n.id === id);
}

function makeState(
  nodes: BSTNodeData[],
  rootId: string | null,
  overrides: Partial<BSTState>,
): BSTState {
  const positions = layoutBST(nodes, rootId);
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
    ...overrides,
  };
}

// Find the in-order successor (minimum node in the right subtree)
function findMinId(nodes: BSTNodeData[], id: string): string {
  let current = findNode(nodes, id)!;
  while (current.left !== null) {
    current = findNode(nodes, current.left)!;
  }
  return current.id;
}

// ---------------------------------------------------------------------------
// BST Algorithm
// ---------------------------------------------------------------------------

export const bst: Algorithm<BSTState, BSTInput> = {
  meta: {
    name: 'Binary Search Tree',
    slug: 'bst',
    category: 'tree',
    complexity: {
      time: { best: 'O(log n)', average: 'O(log n)', worst: 'O(n)' },
      space: 'O(n)',
    },
    pseudocode: [
      'procedure BST-Insert(root, value)',
      '  if root is null then',
      '    return new Node(value)',
      '  if value < root.value then',
      '    root.left <- Insert(root.left, value)',
      '  else if value > root.value then',
      '    root.right <- Insert(root.right, value)',
      '  return root',
      '',
      'procedure BST-Delete(root, value)',
      '  if root is null then return null',
      '  if value < root.value then',
      '    root.left <- Delete(root.left, value)',
      '  else if value > root.value then',
      '    root.right <- Delete(root.right, value)',
      '  else',
      '    if no children: return null',
      '    if one child: return that child',
      '    succ <- minimum of root.right',
      '    root.value <- succ.value',
      '    root.right <- Delete(root.right, succ)',
      '  return root',
    ],
  },

  generateSteps(input: BSTInput): AlgorithmStep<BSTState>[] {
    // Reset counter for deterministic IDs within a single run
    nodeCounter = 0;

    const steps: AlgorithmStep<BSTState>[] = [];
    let nodes: BSTNodeData[] = [];
    let rootId: string | null = null;

    // --- Initial empty state ---
    steps.push({
      state: makeState([], null, { message: 'Starting with an empty BST' }),
      activeLines: [0],
      description: 'Starting with an empty BST',
      action: 'init',
    });

    // Process each operation
    for (const op of input.operations) {
      if (op.type === 'insert') {
        // ---- INSERT ----
        const value = op.value;

        if (rootId === null) {
          // Tree is empty -- create root
          const newId = nextNodeId();
          nodes = [{ id: newId, value, left: null, right: null }];
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

        // Tree is not empty -- traverse to find insertion point
        let currentId: string | null = rootId;
        const path: string[] = [];

        while (currentId !== null) {
          const currentNode = findNode(nodes, currentId)!;
          path.push(currentId);

          // Compare step
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
              // Insert as left child
              const newId = nextNodeId();
              const newNode: BSTNodeData = { id: newId, value, left: null, right: null };
              nodes = [...cloneNodes(nodes)];
              findNode(nodes, currentId)!.left = newId;
              nodes.push(newNode);

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
              currentId = currentNode.left;
            }
          } else if (value > currentNode.value) {
            if (currentNode.right === null) {
              // Insert as right child
              const newId = nextNodeId();
              const newNode: BSTNodeData = { id: newId, value, left: null, right: null };
              nodes = [...cloneNodes(nodes)];
              findNode(nodes, currentId)!.right = newId;
              nodes.push(newNode);

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
              currentId = currentNode.right;
            }
          } else {
            // Duplicate value -- skip
            steps.push({
              state: makeState(nodes, rootId, {
                current: currentId,
                highlightPath: [...path],
                comparedValue: value,
                message: `Value ${value} already exists — skipping`,
              }),
              activeLines: [7],
              description: `Value ${value} already exists in the tree — skipping`,
              action: 'compare',
            });
            break;
          }
        }
      } else if (op.type === 'delete') {
        // ---- DELETE ----
        const value = op.value;

        // Search for the node to delete
        let currentId: string | null = rootId;
        let parentId: string | null = null;
        let isLeftChild = false;
        const path: string[] = [];

        while (currentId !== null) {
          const currentNode = findNode(nodes, currentId)!;
          path.push(currentId);

          if (value === currentNode.value) {
            // Found node to delete
            steps.push({
              state: makeState(nodes, rootId, {
                current: currentId,
                highlightPath: [...path],
                justDeleted: currentId,
                comparedValue: value,
                message: `Found ${value} — deleting`,
              }),
              activeLines: [15],
              description: `Found node ${value} — preparing to delete`,
              action: 'compare',
            });

            // Case 1: Leaf node (no children)
            if (currentNode.left === null && currentNode.right === null) {
              nodes = cloneNodes(nodes).filter((n) => n.id !== currentId);
              if (parentId === null) {
                rootId = null;
              } else {
                const parent = findNode(nodes, parentId)!;
                if (isLeftChild) parent.left = null;
                else parent.right = null;
              }

              steps.push({
                state: makeState(nodes, rootId, {
                  highlightPath: path.slice(0, -1),
                  comparedValue: value,
                  message: `Deleted leaf node ${value}`,
                }),
                activeLines: [16],
                description: `Delete leaf node ${value} (no children)`,
                action: 'delete',
              });
            }
            // Case 2: One child
            else if (currentNode.left === null || currentNode.right === null) {
              const childId = currentNode.left !== null ? currentNode.left : currentNode.right!;
              nodes = cloneNodes(nodes).filter((n) => n.id !== currentId);
              if (parentId === null) {
                rootId = childId;
              } else {
                const parent = findNode(nodes, parentId)!;
                if (isLeftChild) parent.left = childId;
                else parent.right = childId;
              }

              steps.push({
                state: makeState(nodes, rootId, {
                  highlightPath: path.slice(0, -1),
                  comparedValue: value,
                  message: `Deleted ${value} — replaced by its child`,
                }),
                activeLines: [17],
                description: `Delete node ${value} — replaced by its single child`,
                action: 'delete',
              });
            }
            // Case 3: Two children
            else {
              const succId = findMinId(nodes, currentNode.right);
              const succNode = findNode(nodes, succId)!;
              const succValue = succNode.value;

              steps.push({
                state: makeState(nodes, rootId, {
                  current: succId,
                  highlightPath: [...path],
                  comparedValue: value,
                  message: `Found inorder successor ${succValue}`,
                }),
                activeLines: [18, 19],
                description: `Inorder successor of ${value} is ${succValue}`,
                action: 'highlight',
              });

              // Copy successor value into current node
              nodes = cloneNodes(nodes);
              findNode(nodes, currentId!)!.value = succValue;

              // Delete the successor (which has at most one child — right child)
              const succParentId = findSuccessorParent(nodes, currentId!, succId);
              const succNodeClone = findNode(nodes, succId)!;
              const succChild = succNodeClone.right; // successor's left is always null (it's the min)

              nodes = nodes.filter((n) => n.id !== succId);
              if (succParentId === currentId) {
                findNode(nodes, currentId!)!.right = succChild;
              } else if (succParentId !== null) {
                findNode(nodes, succParentId)!.left = succChild;
              }

              steps.push({
                state: makeState(nodes, rootId, {
                  highlightPath: path.slice(0, -1),
                  comparedValue: value,
                  message: `Replaced ${value} with ${succValue} and deleted successor`,
                }),
                activeLines: [19, 20],
                description: `Replace ${value} with successor ${succValue} and remove successor node`,
                action: 'delete',
              });
            }
            break;
          }

          // Not found yet -- continue searching
          steps.push({
            state: makeState(nodes, rootId, {
              current: currentId,
              highlightPath: [...path],
              comparedValue: value,
              message: `Compare ${value} with ${currentNode.value}`,
            }),
            activeLines: value < currentNode.value ? [11, 12] : [13, 14],
            description: `Searching for ${value}: compare with ${currentNode.value} — go ${value < currentNode.value ? 'left' : 'right'}`,
            action: 'compare',
          });

          parentId = currentId;
          if (value < currentNode.value) {
            isLeftChild = true;
            currentId = currentNode.left;
          } else {
            isLeftChild = false;
            currentId = currentNode.right;
          }
        }

        // Node not found
        if (currentId === null && path.length > 0) {
          const lastNode = findNode(nodes, path[path.length - 1]);
          if (lastNode && lastNode.value !== value) {
            steps.push({
              state: makeState(nodes, rootId, {
                highlightPath: [...path],
                comparedValue: value,
                message: `Value ${value} not found in tree`,
              }),
              activeLines: [10],
              description: `Value ${value} not found in the tree`,
              action: 'compare',
            });
          }
        }
      }
    }

    // Final "done" step
    steps.push({
      state: makeState(nodes, rootId, {
        message: 'All operations complete',
      }),
      activeLines: [],
      description: 'All BST operations complete',
      action: 'done',
    });

    return steps;
  },
};

// ---------------------------------------------------------------------------
// Helper: find the parent of the in-order successor node within the subtree
// ---------------------------------------------------------------------------

function findSuccessorParent(
  nodes: BSTNodeData[],
  startId: string,
  succId: string,
): string | null {
  const startNode = findNode(nodes, startId)!;
  if (startNode.right === succId) return startId;

  let parentId = startId;
  let currentId = startNode.right;

  while (currentId !== null && currentId !== succId) {
    const current = findNode(nodes, currentId)!;
    parentId = currentId;
    currentId = current.left;
  }

  return parentId;
}

// Default operations for the BST visualizer
export const DEFAULT_BST_OPERATIONS = [
  { type: 'insert' as const, value: 50 },
  { type: 'insert' as const, value: 30 },
  { type: 'insert' as const, value: 70 },
  { type: 'insert' as const, value: 20 },
  { type: 'insert' as const, value: 40 },
  { type: 'insert' as const, value: 60 },
  { type: 'insert' as const, value: 80 },
  { type: 'delete' as const, value: 30 },
];
