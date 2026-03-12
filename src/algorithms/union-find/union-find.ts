import type { Algorithm, AlgorithmStep } from '../types';
import type { UnionFindState, UnionFindInput, UFNodePosition, UFEdge } from './types';

// Color palette for distinct sets
const SET_COLORS = [
  'var(--color-accent)',
  'var(--color-accent-secondary)',
  'var(--color-success)',
  'var(--color-highlight)',
  '#e879f9', // purple
  '#f97316', // orange
  '#06b6d4', // cyan
  '#f43f5e', // rose
  '#84cc16', // lime
  '#a78bfa', // violet
  '#fb923c', // amber
  '#2dd4bf', // teal
  '#e11d48', // pink
  '#7c3aed', // deep purple
  '#0ea5e9', // sky
  '#65a30d', // green
];

function findRoot(parent: number[], x: number): number {
  while (parent[x] !== x) x = parent[x];
  return x;
}

function layoutForest(parent: number[], rank: number[], n: number, setColors: Record<number, string>): { nodes: UFNodePosition[]; edges: UFEdge[] } {
  // Build children map
  const children: Map<number, number[]> = new Map();
  const roots: number[] = [];

  for (let i = 0; i < n; i++) {
    if (parent[i] === i) {
      roots.push(i);
    } else {
      if (!children.has(parent[i])) children.set(parent[i], []);
      children.get(parent[i])!.push(i);
    }
  }

  // BFS each tree to compute layout
  const nodes: UFNodePosition[] = [];
  const edges: UFEdge[] = [];
  let xOffset = 0;

  for (const root of roots) {
    // BFS to get tree width and assign positions
    const queue: { id: number; depth: number }[] = [{ id: root, depth: 0 }];
    const treeNodes: { id: number; depth: number }[] = [];
    let maxDepth = 0;

    while (queue.length > 0) {
      const cur = queue.shift()!;
      treeNodes.push(cur);
      if (cur.depth > maxDepth) maxDepth = cur.depth;
      const kids = children.get(cur.id) || [];
      for (const kid of kids) {
        queue.push({ id: kid, depth: cur.depth + 1 });
      }
    }

    // Assign x positions using BFS order per depth level
    const byDepth: Map<number, number[]> = new Map();
    for (const tn of treeNodes) {
      if (!byDepth.has(tn.depth)) byDepth.set(tn.depth, []);
      byDepth.get(tn.depth)!.push(tn.id);
    }

    let treeWidth = 0;
    for (const [, ids] of byDepth) {
      treeWidth = Math.max(treeWidth, ids.length);
    }

    const rootColor = setColors[root] || SET_COLORS[root % SET_COLORS.length];

    for (const [depth, ids] of byDepth) {
      const levelWidth = ids.length;
      for (let i = 0; i < ids.length; i++) {
        const x = xOffset + (levelWidth === 1 ? treeWidth / 2 : (i / (levelWidth - 1)) * (treeWidth - 1));
        nodes.push({
          id: ids[i],
          x,
          y: depth,
          rank: rank[ids[i]],
          parent: parent[ids[i]],
          setColor: rootColor,
        });
      }
    }

    // Edges: parent pointers (child -> parent)
    for (const tn of treeNodes) {
      if (parent[tn.id] !== tn.id) {
        edges.push({ from: tn.id, to: parent[tn.id] });
      }
    }

    xOffset += treeWidth + 1.5;
  }

  // Normalize positions to 0..1
  const maxX = Math.max(1, ...nodes.map((n) => n.x));
  const maxY = Math.max(1, ...nodes.map((n) => n.y));
  for (const node of nodes) {
    node.x = nodes.length === 1 ? 0.5 : node.x / maxX;
    node.y = maxY === 0 ? 0.3 : node.y / maxY;
  }

  return { nodes, edges };
}

function makeState(
  parent: number[],
  rank: number[],
  n: number,
  setColors: Record<number, string>,
  overrides: Partial<UnionFindState>,
): UnionFindState {
  const { nodes, edges } = layoutForest(parent, rank, n, setColors);
  return {
    parent: [...parent],
    rank: [...rank],
    nodes,
    edges,
    highlightedNodes: [],
    compressingFrom: null,
    compressingTo: null,
    setColors: { ...setColors },
    justUnioned: null,
    message: '',
    ...overrides,
  };
}

export const unionFind: Algorithm<UnionFindState, UnionFindInput> = {
  meta: {
    name: 'Union-Find',
    slug: 'union-find',
    category: 'union-find',
    complexity: {
      time: { best: 'O(\u03B1(n))', average: 'O(\u03B1(n))', worst: 'O(\u03B1(n))' },
      space: 'O(n)',
    },
    pseudocode: [
      'procedure Find(x)',
      '  if parent[x] \u2260 x then',
      '    parent[x] \u2190 Find(parent[x])  // path compression',
      '  return parent[x]',
      '',
      'procedure Union(x, y)',
      '  rootX \u2190 Find(x)',
      '  rootY \u2190 Find(y)',
      '  if rootX = rootY then return  // same set',
      '  if rank[rootX] < rank[rootY] then',
      '    parent[rootX] \u2190 rootY',
      '  else if rank[rootX] > rank[rootY] then',
      '    parent[rootY] \u2190 rootX',
      '  else',
      '    parent[rootY] \u2190 rootX',
      '    rank[rootX] \u2190 rank[rootX] + 1',
    ],
  },

  generateSteps(input: UnionFindInput): AlgorithmStep<UnionFindState>[] {
    const { n, operations } = input;
    const steps: AlgorithmStep<UnionFindState>[] = [];

    const parent = Array.from({ length: n }, (_, i) => i);
    const rank = new Array(n).fill(0);
    const setColors: Record<number, string> = {};
    for (let i = 0; i < n; i++) {
      setColors[i] = SET_COLORS[i % SET_COLORS.length];
    }

    steps.push({
      state: makeState(parent, rank, n, setColors, {
        message: `Initialize ${n} elements, each in its own set`,
      }),
      activeLines: [],
      description: `Initialize Union-Find with ${n} elements`,
      action: 'init',
    });

    for (const op of operations) {
      if (op.type === 'find') {
        const x = op.args[0];

        // Show starting find
        steps.push({
          state: makeState(parent, rank, n, setColors, {
            highlightedNodes: [x],
            message: `Find(${x}): follow parent pointers to root`,
          }),
          activeLines: [0, 1],
          description: `Find(${x}): starting search for root`,
          action: 'find',
        });

        // Walk to root, highlighting path
        const path: number[] = [x];
        let cur = x;
        while (parent[cur] !== cur) {
          cur = parent[cur];
          path.push(cur);
        }
        const root = cur;

        if (path.length > 1) {
          steps.push({
            state: makeState(parent, rank, n, setColors, {
              highlightedNodes: [...path],
              message: `Path: ${path.join(' \u2192 ')} (root = ${root})`,
            }),
            activeLines: [1, 2, 3],
            description: `Found root ${root} via path: ${path.join(' \u2192 ')}`,
            action: 'find',
          });
        }

        // Path compression
        if (path.length > 2) {
          for (const nodeId of path) {
            if (nodeId !== root && parent[nodeId] !== root) {
              parent[nodeId] = root;
              steps.push({
                state: makeState(parent, rank, n, setColors, {
                  highlightedNodes: [nodeId, root],
                  compressingFrom: nodeId,
                  compressingTo: root,
                  message: `Path compression: parent[${nodeId}] \u2190 ${root}`,
                }),
                activeLines: [2],
                description: `Compress: point ${nodeId} directly to root ${root}`,
                action: 'compress',
              });
            }
          }
        }

        steps.push({
          state: makeState(parent, rank, n, setColors, {
            highlightedNodes: [root],
            message: `Find(${x}) = ${root}`,
          }),
          activeLines: [3],
          description: `Find(${x}) returns ${root}`,
          action: 'find',
        });
      } else if (op.type === 'union') {
        const [x, y] = op.args as [number, number];

        steps.push({
          state: makeState(parent, rank, n, setColors, {
            highlightedNodes: [x, y],
            message: `Union(${x}, ${y})`,
          }),
          activeLines: [5],
          description: `Union(${x}, ${y}): merge their sets`,
          action: 'union',
        });

        // Find roots
        let rootX = x;
        while (parent[rootX] !== rootX) rootX = parent[rootX];
        let rootY = y;
        while (parent[rootY] !== rootY) rootY = parent[rootY];

        steps.push({
          state: makeState(parent, rank, n, setColors, {
            highlightedNodes: [rootX, rootY],
            message: `Root of ${x} = ${rootX}, Root of ${y} = ${rootY}`,
          }),
          activeLines: [6, 7],
          description: `Find roots: root(${x})=${rootX}, root(${y})=${rootY}`,
          action: 'find',
        });

        if (rootX === rootY) {
          steps.push({
            state: makeState(parent, rank, n, setColors, {
              highlightedNodes: [rootX],
              message: `${x} and ${y} already in same set (root = ${rootX})`,
            }),
            activeLines: [8],
            description: `${x} and ${y} already in same set — skip`,
            action: 'union',
          });
          continue;
        }

        // Union by rank
        if (rank[rootX] < rank[rootY]) {
          parent[rootX] = rootY;
          setColors[rootX] = setColors[rootY];
          steps.push({
            state: makeState(parent, rank, n, setColors, {
              highlightedNodes: [rootX, rootY],
              justUnioned: [rootX, rootY],
              message: `rank[${rootX}]<rank[${rootY}]: attach ${rootX} under ${rootY}`,
            }),
            activeLines: [9, 10],
            description: `Attach tree rooted at ${rootX} under ${rootY} (lower rank)`,
            action: 'union',
          });
        } else if (rank[rootX] > rank[rootY]) {
          parent[rootY] = rootX;
          setColors[rootY] = setColors[rootX];
          steps.push({
            state: makeState(parent, rank, n, setColors, {
              highlightedNodes: [rootX, rootY],
              justUnioned: [rootY, rootX],
              message: `rank[${rootX}]>rank[${rootY}]: attach ${rootY} under ${rootX}`,
            }),
            activeLines: [11, 12],
            description: `Attach tree rooted at ${rootY} under ${rootX} (lower rank)`,
            action: 'union',
          });
        } else {
          parent[rootY] = rootX;
          rank[rootX]++;
          setColors[rootY] = setColors[rootX];
          steps.push({
            state: makeState(parent, rank, n, setColors, {
              highlightedNodes: [rootX, rootY],
              justUnioned: [rootY, rootX],
              message: `Equal rank: attach ${rootY} under ${rootX}, rank[${rootX}]++`,
            }),
            activeLines: [13, 14, 15],
            description: `Equal rank: attach ${rootY} under ${rootX}, increment rank`,
            action: 'union',
          });
        }

        // Propagate root color to all nodes in the merged set
        for (let i = 0; i < n; i++) {
          const r = findRoot(parent, i);
          setColors[i] = setColors[r];
        }
      }
    }

    steps.push({
      state: makeState(parent, rank, n, setColors, {
        message: 'All operations complete',
      }),
      activeLines: [],
      description: 'All Union-Find operations complete',
      action: 'done',
    });

    return steps;
  },
};

export const DEFAULT_UF_OPERATIONS: UnionFindInput = {
  n: 8,
  operations: [
    { type: 'union', args: [0, 1] },
    { type: 'union', args: [2, 3] },
    { type: 'union', args: [4, 5] },
    { type: 'union', args: [0, 2] },
    { type: 'find', args: [3] },
    { type: 'union', args: [6, 7] },
    { type: 'union', args: [4, 6] },
    { type: 'union', args: [0, 4] },
    { type: 'find', args: [7] },
  ],
};
