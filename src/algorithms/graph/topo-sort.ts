import type { Algorithm, AlgorithmStep } from '../types';
import type { GraphState, GraphInput } from './types';

function buildAdjacencyList(input: GraphInput): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  for (const node of input.nodes) {
    adj.set(node.id, []);
  }
  for (const edge of input.edges) {
    adj.get(edge.from)!.push(edge.to);
  }
  for (const [, neighbors] of adj) {
    neighbors.sort();
  }
  return adj;
}

function computeInDegrees(input: GraphInput): Map<string, number> {
  const inDeg = new Map<string, number>();
  for (const node of input.nodes) {
    inDeg.set(node.id, 0);
  }
  for (const edge of input.edges) {
    inDeg.set(edge.to, (inDeg.get(edge.to) || 0) + 1);
  }
  return inDeg;
}

function makeState(
  input: GraphInput,
  overrides: Partial<GraphState>,
): GraphState {
  return {
    nodes: input.nodes,
    edges: input.edges,
    visited: [],
    current: null,
    frontier: [],
    currentEdge: null,
    discoveryOrder: [],
    ...overrides,
  };
}

export const topoSort: Algorithm<GraphState, GraphInput> = {
  meta: {
    name: 'Topological Sort',
    slug: 'topo-sort',
    category: 'graph',
    complexity: {
      time: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
      space: 'O(V)',
    },
    pseudocode: [
      'procedure TopologicalSort(G)',
      '  compute in-degree for all nodes',
      '  queue \u2190 nodes with in-degree 0',
      '  order \u2190 []',
      '  while queue is not empty do',
      '    current \u2190 queue.dequeue()',
      '    order.append(current)',
      '    for each neighbor of current do',
      '      in-degree[neighbor] -= 1',
      '      if in-degree[neighbor] = 0 then',
      '        queue.enqueue(neighbor)',
      '  return order',
    ],
  },

  generateSteps(input: GraphInput): AlgorithmStep<GraphState>[] {
    const steps: AlgorithmStep<GraphState>[] = [];
    const adj = buildAdjacencyList(input);
    const inDeg = computeInDegrees(input);

    const visited: string[] = [];
    const frontier: string[] = [];
    const order: string[] = [];

    // Init step
    steps.push({
      state: makeState(input, {
        current: null,
        visited: [],
        frontier: [],
        currentEdge: null,
        discoveryOrder: [],
      }),
      activeLines: [0, 1],
      description: 'Compute in-degree for each node',
      action: 'init',
    });

    // Find all nodes with in-degree 0
    for (const node of input.nodes) {
      if (inDeg.get(node.id) === 0) {
        frontier.push(node.id);
      }
    }

    steps.push({
      state: makeState(input, {
        current: null,
        visited: [],
        frontier: [...frontier],
        currentEdge: null,
        discoveryOrder: [],
      }),
      activeLines: [2],
      description: `Enqueue nodes with in-degree 0: ${frontier.map(id => input.nodes.find(n => n.id === id)!.label).join(', ')}`,
      action: 'enqueue',
    });

    // Main Kahn's loop
    while (frontier.length > 0) {
      const currentId = frontier.shift()!;
      const currentNode = input.nodes.find((n) => n.id === currentId)!;

      // Dequeue step
      steps.push({
        state: makeState(input, {
          current: currentId,
          visited: [...visited],
          frontier: [...frontier],
          currentEdge: null,
          discoveryOrder: [...order],
        }),
        activeLines: [4, 5],
        description: `Dequeue ${currentNode.label} from queue`,
        action: 'dequeue',
      });

      // Add to topological order (visit)
      visited.push(currentId);
      order.push(currentId);
      steps.push({
        state: makeState(input, {
          current: currentId,
          visited: [...visited],
          frontier: [...frontier],
          currentEdge: null,
          discoveryOrder: [...order],
        }),
        activeLines: [6],
        description: `Add ${currentNode.label} to topological order (position ${order.length})`,
        action: 'visit',
      });

      // Process neighbors — decrement in-degrees
      const neighbors = adj.get(currentId) || [];
      for (const neighborId of neighbors) {
        const neighborNode = input.nodes.find((n) => n.id === neighborId)!;
        const newDeg = (inDeg.get(neighborId) || 1) - 1;
        inDeg.set(neighborId, newDeg);

        steps.push({
          state: makeState(input, {
            current: currentId,
            visited: [...visited],
            frontier: [...frontier],
            currentEdge: [currentId, neighborId],
            discoveryOrder: [...order],
          }),
          activeLines: [7, 8],
          description: `Remove edge ${currentNode.label}\u2192${neighborNode.label}, in-degree[${neighborNode.label}] = ${newDeg}`,
          action: 'compare',
        });

        if (newDeg === 0) {
          frontier.push(neighborId);
          steps.push({
            state: makeState(input, {
              current: currentId,
              visited: [...visited],
              frontier: [...frontier],
              currentEdge: [currentId, neighborId],
              discoveryOrder: [...order],
            }),
            activeLines: [9, 10],
            description: `In-degree of ${neighborNode.label} is 0 \u2014 enqueue it`,
            action: 'enqueue',
          });
        }
      }
    }

    // Done step
    steps.push({
      state: makeState(input, {
        current: null,
        visited: [...visited],
        frontier: [],
        currentEdge: null,
        discoveryOrder: [...order],
      }),
      activeLines: [11],
      description: `Topological order: ${order.map(id => input.nodes.find(n => n.id === id)!.label).join(' \u2192 ')}`,
      action: 'done',
    });

    return steps;
  },
};
