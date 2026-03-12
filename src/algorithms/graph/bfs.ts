import type { Algorithm, AlgorithmStep } from '../types';
import type { GraphState, GraphInput } from './types';

function buildAdjacencyList(input: GraphInput): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  for (const node of input.nodes) {
    adj.set(node.id, []);
  }
  for (const edge of input.edges) {
    adj.get(edge.from)!.push(edge.to);
    if (!input.directed) {
      adj.get(edge.to)!.push(edge.from);
    }
  }
  // Sort neighbors alphabetically for deterministic traversal
  for (const [, neighbors] of adj) {
    neighbors.sort();
  }
  return adj;
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

export const bfs: Algorithm<GraphState, GraphInput> = {
  meta: {
    name: 'Breadth-First Search',
    slug: 'bfs',
    category: 'graph',
    complexity: {
      time: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
      space: 'O(V)',
    },
    pseudocode: [
      'procedure BFS(G, start)',
      '  queue \u2190 [start]',
      '  visited \u2190 {}',
      '  while queue is not empty do',
      '    current \u2190 queue.dequeue()',
      '    if current in visited then continue',
      '    visited.add(current)',
      '    for each neighbor of current do',
      '      if neighbor not visited then',
      '        queue.enqueue(neighbor)',
      '  return visited',
    ],
  },

  generateSteps(input: GraphInput): AlgorithmStep<GraphState>[] {
    const steps: AlgorithmStep<GraphState>[] = [];
    const adj = buildAdjacencyList(input);

    const visited: string[] = [];
    const frontier: string[] = [];
    const discoveryOrder: string[] = [];
    const startNode = input.nodes.find((n) => n.id === input.startNodeId)!;

    // Init step
    steps.push({
      state: makeState(input, {
        current: null,
        visited: [],
        frontier: [],
        currentEdge: null,
        discoveryOrder: [],
      }),
      activeLines: [0],
      description: `Starting BFS from node ${startNode.label}`,
      action: 'init',
    });

    // Enqueue start node
    frontier.push(input.startNodeId);
    discoveryOrder.push(input.startNodeId);
    steps.push({
      state: makeState(input, {
        current: null,
        visited: [...visited],
        frontier: [...frontier],
        currentEdge: null,
        discoveryOrder: [...discoveryOrder],
      }),
      activeLines: [1],
      description: `Enqueue start node ${startNode.label}`,
      action: 'enqueue',
    });

    // Main BFS loop
    while (frontier.length > 0) {
      // Dequeue front of queue
      const currentId = frontier.shift()!;
      const currentNode = input.nodes.find((n) => n.id === currentId)!;

      // Check if already visited (skip)
      if (visited.includes(currentId)) {
        steps.push({
          state: makeState(input, {
            current: currentId,
            visited: [...visited],
            frontier: [...frontier],
            currentEdge: null,
            discoveryOrder: [...discoveryOrder],
          }),
          activeLines: [4, 5],
          description: `Dequeue ${currentNode.label} \u2014 already visited, skip`,
          action: 'dequeue',
        });
        continue;
      }

      // Dequeue step
      steps.push({
        state: makeState(input, {
          current: currentId,
          visited: [...visited],
          frontier: [...frontier],
          currentEdge: null,
          discoveryOrder: [...discoveryOrder],
        }),
        activeLines: [3, 4],
        description: `Dequeue ${currentNode.label} from the queue`,
        action: 'dequeue',
      });

      // Visit step
      visited.push(currentId);
      steps.push({
        state: makeState(input, {
          current: currentId,
          visited: [...visited],
          frontier: [...frontier],
          currentEdge: null,
          discoveryOrder: [...discoveryOrder],
        }),
        activeLines: [6],
        description: `Visit node ${currentNode.label}`,
        action: 'visit',
      });

      // Explore neighbors
      const neighbors = adj.get(currentId) || [];
      for (const neighborId of neighbors) {
        const neighborNode = input.nodes.find((n) => n.id === neighborId)!;

        if (!visited.includes(neighborId) && !frontier.includes(neighborId)) {
          // Enqueue neighbor
          frontier.push(neighborId);
          discoveryOrder.push(neighborId);
          steps.push({
            state: makeState(input, {
              current: currentId,
              visited: [...visited],
              frontier: [...frontier],
              currentEdge: [currentId, neighborId],
              discoveryOrder: [...discoveryOrder],
            }),
            activeLines: [7, 8, 9],
            description: `Enqueue neighbor ${neighborNode.label} (via edge ${currentNode.label}\u2192${neighborNode.label})`,
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
        discoveryOrder: [...discoveryOrder],
      }),
      activeLines: [10],
      description: `BFS complete! Visited ${visited.length} nodes in order: ${discoveryOrder.join(' \u2192 ')}`,
      action: 'done',
    });

    return steps;
  },
};
