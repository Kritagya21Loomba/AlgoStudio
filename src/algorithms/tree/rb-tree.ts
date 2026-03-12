import type { Algorithm, AlgorithmStep } from '../types';
import type { RBState, RBInput, RBNodeData, RBColor, RBTreeNodePosition } from './rb-types';

/* --- Internal BST with color --- */
class RBNode {
  id: string;
  value: number;
  color: RBColor = 'red';
  left: RBNode | null = null;
  right: RBNode | null = null;
  parent: RBNode | null = null;

  constructor(value: number, id: string) {
    this.value = value;
    this.id = id;
  }
}

/* --- Layout --- */
function layoutRBTree(root: RBNode | null): { nodes: RBTreeNodePosition[]; edges: { from: string; to: string }[] } {
  const nodes: RBTreeNodePosition[] = [];
  const edges: { from: string; to: string }[] = [];
  if (!root) return { nodes, edges };

  // In-order to assign x positions
  const inorder: RBNode[] = [];
  function collectInorder(n: RBNode | null) {
    if (!n) return;
    collectInorder(n.left);
    inorder.push(n);
    collectInorder(n.right);
  }
  collectInorder(root);

  const indexMap = new Map<string, number>();
  inorder.forEach((n, i) => indexMap.set(n.id, i));

  function dfs(n: RBNode | null, depth: number) {
    if (!n) return;
    const idx = indexMap.get(n.id)!;
    const x = 0.08 + (idx / Math.max(1, inorder.length - 1)) * 0.84;
    const y = 0.08 + depth * 0.18;
    nodes.push({ id: n.id, value: n.value, x, y, color: n.color });
    if (n.left) {
      edges.push({ from: n.id, to: n.left.id });
      dfs(n.left, depth + 1);
    }
    if (n.right) {
      edges.push({ from: n.id, to: n.right.id });
      dfs(n.right, depth + 1);
    }
  }
  dfs(root, 0);
  return { nodes, edges };
}

function makeState(root: RBNode | null, overrides: Partial<RBState>): RBState {
  const layout = layoutRBTree(root);
  return {
    nodes: layout.nodes,
    edges: layout.edges,
    current: null,
    highlightPath: [],
    justInserted: null,
    recoloredNodes: [],
    rotatingNodes: [],
    rotationType: null,
    message: '',
    ...overrides,
  };
}

/* --- Red-Black Tree operations --- */
function rotateLeft(root: RBNode, x: RBNode): RBNode {
  const y = x.right!;
  x.right = y.left;
  if (y.left) y.left.parent = x;
  y.parent = x.parent;
  if (!x.parent) root = y;
  else if (x === x.parent.left) x.parent.left = y;
  else x.parent.right = y;
  y.left = x;
  x.parent = y;
  return root;
}

function rotateRight(root: RBNode, x: RBNode): RBNode {
  const y = x.left!;
  x.left = y.right;
  if (y.right) y.right.parent = x;
  y.parent = x.parent;
  if (!x.parent) root = y;
  else if (x === x.parent.right) x.parent.right = y;
  else x.parent.left = y;
  y.right = x;
  x.parent = y;
  return root;
}

let nodeCounter = 0;

function insertBST(root: RBNode | null, value: number): { root: RBNode; inserted: RBNode } {
  const newNode = new RBNode(value, `rb-${nodeCounter++}`);
  if (!root) {
    return { root: newNode, inserted: newNode };
  }

  let curr: RBNode | null = root;
  let parent: RBNode | null = null;

  while (curr) {
    parent = curr;
    if (value < curr.value) curr = curr.left;
    else if (value > curr.value) curr = curr.right;
    else return { root, inserted: curr }; // duplicate, no-op
  }

  newNode.parent = parent;
  if (value < parent!.value) parent!.left = newNode;
  else parent!.right = newNode;

  return { root, inserted: newNode };
}

export const rbTree: Algorithm<RBState, RBInput> = {
  meta: {
    name: 'Red-Black Tree',
    slug: 'rb-tree',
    category: 'tree',
    complexity: {
      time: { best: 'O(log n)', average: 'O(log n)', worst: 'O(log n)' },
      space: 'O(n)',
    },
    pseudocode: [
      'procedure insert(value)',
      '  BST-insert new RED node z',
      '  fix-up(z)',
      '',
      'procedure fix-up(z)',
      '  while z.parent is RED do',
      '    if z.parent is left child then',
      '      uncle \u2190 grandparent.right',
      '      Case 1: uncle is RED \u2192 recolor',
      '      Case 2: z is right child \u2192 left-rotate parent',
      '      Case 3: z is left child \u2192 right-rotate grandparent, recolor',
      '    else (mirror cases)',
      '  root.color \u2190 BLACK',
    ],
  },

  generateSteps(input: RBInput): AlgorithmStep<RBState>[] {
    const steps: AlgorithmStep<RBState>[] = [];
    nodeCounter = 0;
    let root: RBNode | null = null;

    steps.push({
      state: makeState(null, { message: 'Red-Black Tree: insert with fix-up' }),
      activeLines: [],
      description: 'Start with empty Red-Black tree',
      action: 'init',
    });

    for (const op of input.operations) {
      if (op.type !== 'insert') continue;

      // BST insert
      const { root: newRoot, inserted: z } = insertBST(root, op.value);
      root = newRoot;
      z.color = 'red';

      steps.push({
        state: makeState(root, {
          justInserted: z.id,
          current: z.id,
          message: `Insert ${op.value} as RED node`,
        }),
        activeLines: [0, 1],
        description: `BST-insert ${op.value} (colored RED)`,
        action: 'insert',
      });

      // Fix-up
      let curr = z;
      while (curr.parent && curr.parent.color === 'red') {
        const parent = curr.parent;
        const grandparent = parent.parent;
        if (!grandparent) break;

        if (parent === grandparent.left) {
          const uncle = grandparent.right;

          if (uncle && uncle.color === 'red') {
            // Case 1: uncle is red — recolor
            parent.color = 'black';
            uncle.color = 'black';
            grandparent.color = 'red';
            steps.push({
              state: makeState(root, {
                recoloredNodes: [parent.id, uncle.id, grandparent.id],
                current: grandparent.id,
                message: `Case 1: Uncle is RED \u2192 recolor parent, uncle BLACK; grandparent RED`,
              }),
              activeLines: [5, 6, 7, 8],
              description: 'Case 1: Recolor (uncle is RED)',
              action: 'recolor',
            });
            curr = grandparent;
          } else {
            if (curr === parent.right) {
              // Case 2: curr is right child — left rotate parent
              curr = parent;
              root = rotateLeft(root!, curr);
              steps.push({
                state: makeState(root, {
                  rotatingNodes: [curr.id, curr.parent!.id],
                  rotationType: 'left',
                  message: `Case 2: Left-rotate at ${curr.value}`,
                }),
                activeLines: [9],
                description: `Case 2: Left-rotate at ${curr.value}`,
                action: 'rotate-left',
              });
            }
            // Case 3: curr is left child — right rotate grandparent + recolor
            const p = curr.parent!;
            const gp = p.parent!;
            p.color = 'black';
            gp.color = 'red';
            root = rotateRight(root!, gp);
            steps.push({
              state: makeState(root, {
                rotatingNodes: [p.id, gp.id],
                rotationType: 'right',
                recoloredNodes: [p.id, gp.id],
                message: `Case 3: Right-rotate at ${gp.value}, recolor`,
              }),
              activeLines: [10],
              description: `Case 3: Right-rotate + recolor`,
              action: 'rotate-right',
            });
          }
        } else {
          // Mirror cases (parent is right child of grandparent)
          const uncle = grandparent.left;

          if (uncle && uncle.color === 'red') {
            parent.color = 'black';
            uncle.color = 'black';
            grandparent.color = 'red';
            steps.push({
              state: makeState(root, {
                recoloredNodes: [parent.id, uncle.id, grandparent.id],
                current: grandparent.id,
                message: `Case 1 (mirror): Uncle RED \u2192 recolor`,
              }),
              activeLines: [11, 8],
              description: 'Case 1 (mirror): Recolor',
              action: 'recolor',
            });
            curr = grandparent;
          } else {
            if (curr === parent.left) {
              curr = parent;
              root = rotateRight(root!, curr);
              steps.push({
                state: makeState(root, {
                  rotatingNodes: [curr.id, curr.parent!.id],
                  rotationType: 'right',
                  message: `Case 2 (mirror): Right-rotate at ${curr.value}`,
                }),
                activeLines: [11, 9],
                description: `Case 2 (mirror): Right-rotate at ${curr.value}`,
                action: 'rotate-right',
              });
            }
            const p = curr.parent!;
            const gp = p.parent!;
            p.color = 'black';
            gp.color = 'red';
            root = rotateLeft(root!, gp);
            steps.push({
              state: makeState(root, {
                rotatingNodes: [p.id, gp.id],
                rotationType: 'left',
                recoloredNodes: [p.id, gp.id],
                message: `Case 3 (mirror): Left-rotate at ${gp.value}, recolor`,
              }),
              activeLines: [11, 10],
              description: `Case 3 (mirror): Left-rotate + recolor`,
              action: 'rotate-left',
            });
          }
        }
      }

      // Root must be black
      if (root) root.color = 'black';

      steps.push({
        state: makeState(root, {
          message: `Inserted ${op.value}. Root is BLACK.`,
        }),
        activeLines: [12],
        description: `${op.value} inserted, tree balanced`,
        action: 'done',
      });
    }

    return steps;
  },
};

export const DEFAULT_RB_OPERATIONS: RBInput = {
  operations: [
    { type: 'insert', value: 10 },
    { type: 'insert', value: 20 },
    { type: 'insert', value: 30 },
    { type: 'insert', value: 15 },
    { type: 'insert', value: 25 },
    { type: 'insert', value: 5 },
    { type: 'insert', value: 1 },
  ],
};
