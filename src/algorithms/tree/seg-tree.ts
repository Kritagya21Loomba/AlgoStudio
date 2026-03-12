import type { Algorithm, AlgorithmStep } from '../types';
import type { SegTreeState, SegTreeInput, SegTreeNodeData, SegTreeOperation } from './seg-tree-types';

/* --- Layout helpers --- */
function layoutTree(size: number): Map<number, { x: number; y: number }> {
  const positions = new Map<number, { x: number; y: number }>();
  const depth = Math.ceil(Math.log2(size)) + 1;
  const totalLevels = depth + 1; // +1 for 1-indexed root

  function dfs(node: number, level: number, left: number, right: number) {
    if (node >= 4 * size) return;
    const x = (left + right) / 2;
    const y = level / totalLevels;
    positions.set(node, { x, y });
    const mid = (left + right) / 2;
    dfs(2 * node, level + 1, left, mid);
    dfs(2 * node + 1, level + 1, mid, right);
  }

  dfs(1, 0.5, 0.05, 0.95);
  return positions;
}

function buildTree(arr: number[], tree: number[], node: number, start: number, end: number) {
  if (start === end) {
    tree[node] = arr[start];
    return;
  }
  const mid = Math.floor((start + end) / 2);
  buildTree(arr, tree, 2 * node, start, mid);
  buildTree(arr, tree, 2 * node + 1, mid + 1, end);
  tree[node] = tree[2 * node] + tree[2 * node + 1];
}

function toNodeData(tree: number[], arr: number[], positions: Map<number, { x: number; y: number }>): SegTreeNodeData[] {
  const result: SegTreeNodeData[] = [];
  const n = arr.length;

  function dfs(node: number, start: number, end: number) {
    const pos = positions.get(node);
    if (!pos) return;
    result.push({
      index: node,
      value: tree[node],
      rangeL: start,
      rangeR: end,
      x: pos.x,
      y: pos.y,
    });
    if (start === end) return;
    const mid = Math.floor((start + end) / 2);
    dfs(2 * node, start, mid);
    dfs(2 * node + 1, mid + 1, end);
  }

  dfs(1, 0, n - 1);
  return result;
}

function makeState(
  tree: number[],
  arr: number[],
  positions: Map<number, { x: number; y: number }>,
  overrides: Partial<SegTreeState>
): SegTreeState {
  return {
    tree: toNodeData(tree, arr, positions),
    baseArray: [...arr],
    highlightedNodes: [],
    updatedNode: null,
    queryRange: null,
    queryResult: null,
    message: '',
    ...overrides,
  };
}

export const segTree: Algorithm<SegTreeState, SegTreeInput> = {
  meta: {
    name: 'Segment Tree',
    slug: 'seg-tree',
    category: 'tree',
    complexity: {
      time: { best: 'O(n)', average: 'O(n log n)', worst: 'O(n log n)' },
      space: 'O(n)',
    },
    pseudocode: [
      'procedure build(node, start, end)',
      '  if start = end then',
      '    tree[node] \u2190 arr[start]',
      '  else',
      '    mid \u2190 (start + end) / 2',
      '    build(2*node, start, mid)',
      '    build(2*node+1, mid+1, end)',
      '    tree[node] \u2190 tree[2*node] + tree[2*node+1]',
      '',
      'procedure query(node, start, end, l, r)',
      '  if r < start or end < l then return 0',
      '  if l \u2264 start and end \u2264 r then return tree[node]',
      '  mid \u2190 (start + end) / 2',
      '  return query(left, l, r) + query(right, l, r)',
      '',
      'procedure update(node, start, end, idx, val)',
      '  if start = end then tree[node] \u2190 val',
      '  else',
      '    mid \u2190 (start + end) / 2',
      '    update appropriate child',
      '    tree[node] \u2190 tree[left] + tree[right]',
    ],
  },

  generateSteps(input: SegTreeInput): AlgorithmStep<SegTreeState>[] {
    const steps: AlgorithmStep<SegTreeState>[] = [];
    const arr = [...input.baseArray];
    const n = arr.length;
    const treeArr = new Array(4 * n).fill(0);
    const positions = layoutTree(n);

    // Build phase
    steps.push({
      state: makeState(treeArr, arr, positions, {
        message: `Building segment tree for array [${arr.join(', ')}]`,
      }),
      activeLines: [0],
      description: 'Build segment tree from array',
      action: 'init',
    });

    // Build step-by-step
    const buildSteps: { node: number; start: number; end: number }[] = [];
    function buildAndRecord(node: number, start: number, end: number) {
      if (start === end) {
        treeArr[node] = arr[start];
        buildSteps.push({ node, start, end });
        return;
      }
      const mid = Math.floor((start + end) / 2);
      buildAndRecord(2 * node, start, mid);
      buildAndRecord(2 * node + 1, mid + 1, end);
      treeArr[node] = treeArr[2 * node] + treeArr[2 * node + 1];
      buildSteps.push({ node, start, end });
    }
    buildAndRecord(1, 0, n - 1);

    for (const s of buildSteps) {
      const isLeaf = s.start === s.end;
      steps.push({
        state: makeState(treeArr, arr, positions, {
          highlightedNodes: [s.node],
          message: isLeaf
            ? `Leaf node[${s.node}]: arr[${s.start}] = ${arr[s.start]}`
            : `Internal node[${s.node}]: range [${s.start},${s.end}] = ${treeArr[s.node]}`,
        }),
        activeLines: isLeaf ? [1, 2] : [4, 5, 6, 7],
        description: isLeaf
          ? `Set leaf [${s.start}] = ${arr[s.start]}`
          : `Sum [${s.start},${s.end}] = ${treeArr[s.node]}`,
        action: isLeaf ? 'set' : 'merge',
      });
    }

    steps.push({
      state: makeState(treeArr, arr, positions, {
        message: `Segment tree built. Root = ${treeArr[1]} (total sum)`,
      }),
      activeLines: [],
      description: 'Build complete',
      action: 'done',
    });

    // Process operations
    for (const op of input.operations) {
      if (op.type === 'query' && op.queryL !== undefined && op.queryR !== undefined) {
        const qL = op.queryL;
        const qR = op.queryR;
        const visited: number[] = [];

        function queryRec(node: number, start: number, end: number, l: number, r: number): number {
          if (r < start || end < l) return 0;
          visited.push(node);
          if (l <= start && end <= r) return treeArr[node];
          const mid = Math.floor((start + end) / 2);
          return queryRec(2 * node, start, mid, l, r) + queryRec(2 * node + 1, mid + 1, end, l, r);
        }

        steps.push({
          state: makeState(treeArr, arr, positions, {
            queryRange: [qL, qR],
            message: `Query: sum of range [${qL}, ${qR}]`,
          }),
          activeLines: [9],
          description: `Query sum [${qL}, ${qR}]`,
          action: 'query',
        });

        const result = queryRec(1, 0, n - 1, qL, qR);

        // Show visited nodes
        for (let i = 0; i < visited.length; i++) {
          const vNode = visited[i];
          const nodeData = toNodeData(treeArr, arr, positions).find(nd => nd.index === vNode);
          steps.push({
            state: makeState(treeArr, arr, positions, {
              highlightedNodes: [vNode],
              queryRange: [qL, qR],
              message: nodeData
                ? `Visit node[${vNode}] covering [${nodeData.rangeL},${nodeData.rangeR}]`
                : `Visit node[${vNode}]`,
            }),
            activeLines: [10, 11, 12, 13],
            description: `Visit node ${vNode}`,
            action: 'query',
          });
        }

        steps.push({
          state: makeState(treeArr, arr, positions, {
            queryRange: [qL, qR],
            queryResult: result,
            highlightedNodes: visited,
            message: `Query result: sum [${qL},${qR}] = ${result}`,
          }),
          activeLines: [13],
          description: `Result: sum [${qL},${qR}] = ${result}`,
          action: 'found',
        });
      }

      if (op.type === 'update' && op.updateIdx !== undefined && op.updateVal !== undefined) {
        const idx = op.updateIdx;
        const val = op.updateVal;
        const updatedNodes: number[] = [];

        function updateRec(node: number, start: number, end: number) {
          updatedNodes.push(node);
          if (start === end) {
            treeArr[node] = val;
            return;
          }
          const mid = Math.floor((start + end) / 2);
          if (idx <= mid) updateRec(2 * node, start, mid);
          else updateRec(2 * node + 1, mid + 1, end);
          treeArr[node] = treeArr[2 * node] + treeArr[2 * node + 1];
        }

        steps.push({
          state: makeState(treeArr, arr, positions, {
            message: `Update: set arr[${idx}] = ${val}`,
          }),
          activeLines: [15],
          description: `Update arr[${idx}] = ${val}`,
          action: 'update',
        });

        const oldVal = arr[idx];
        arr[idx] = val;
        updateRec(1, 0, n - 1);

        for (const uNode of updatedNodes) {
          steps.push({
            state: makeState(treeArr, arr, positions, {
              highlightedNodes: [uNode],
              updatedNode: uNode,
              message: `Update node[${uNode}] = ${treeArr[uNode]}`,
            }),
            activeLines: [16, 17, 18, 19, 20],
            description: `Update node ${uNode} = ${treeArr[uNode]}`,
            action: 'update',
          });
        }

        steps.push({
          state: makeState(treeArr, arr, positions, {
            message: `Updated arr[${idx}]: ${oldVal} \u2192 ${val}. New root sum = ${treeArr[1]}`,
          }),
          activeLines: [],
          description: `Update complete. Root = ${treeArr[1]}`,
          action: 'done',
        });
      }
    }

    return steps;
  },
};

export const DEFAULT_SEG_TREE_INPUT: SegTreeInput = {
  baseArray: [1, 3, 5, 7, 9, 11],
  operations: [
    { type: 'query', queryL: 1, queryR: 4 },
    { type: 'update', updateIdx: 2, updateVal: 10 },
    { type: 'query', queryL: 1, queryR: 4 },
  ],
};
