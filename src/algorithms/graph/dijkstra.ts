import type { Algorithm, AlgorithmStep } from '../types';
import type { DijkstraState, DijkstraInput, WeightedEdge } from './dijkstra-types';
import type { GraphNode } from './types';

function buildAdj(input: DijkstraInput): Map<string, { to: string; weight: number }[]> {
  const adj = new Map<string, { to: string; weight: number }[]>();
  for (const node of input.nodes) adj.set(node.id, []);
  for (const edge of input.edges) {
    adj.get(edge.from)!.push({ to: edge.to, weight: edge.weight });
    if (!input.directed) {
      adj.get(edge.to)!.push({ to: edge.from, weight: edge.weight });
    }
  }
  return adj;
}

function makeState(input: DijkstraInput, overrides: Partial<DijkstraState>): DijkstraState {
  return {
    nodes: input.nodes,
    edges: input.edges,
    visited: [],
    current: null,
    distances: {},
    previous: {},
    priorityQueue: [],
    currentEdge: null,
    relaxedEdge: null,
    shortestPath: [],
    message: '',
    ...overrides,
  };
}

export const dijkstra: Algorithm<DijkstraState, DijkstraInput> = {
  meta: {
    name: "Dijkstra's Algorithm",
    slug: 'dijkstra',
    category: 'graph',
    complexity: {
      time: { best: 'O((V+E) log V)', average: 'O((V+E) log V)', worst: 'O((V+E) log V)' },
      space: 'O(V)',
    },
    pseudocode: [
      "procedure Dijkstra(G, start)",
      "  dist[v] ← ∞ for all v",
      "  dist[start] ← 0",
      "  PQ ← {(start, 0)}",
      "  while PQ is not empty do",
      "    u ← PQ.extractMin()",
      "    if u is visited then continue",
      "    mark u as visited",
      "    for each neighbor v of u do",
      "      if dist[u] + w(u,v) < dist[v] then",
      "        dist[v] ← dist[u] + w(u,v)",
      "        prev[v] ← u",
      "        PQ.insert(v, dist[v])",
      "  return dist, prev",
    ],
  },

  generateSteps(input: DijkstraInput): AlgorithmStep<DijkstraState>[] {
    const steps: AlgorithmStep<DijkstraState>[] = [];
    const adj = buildAdj(input);

    const dist: Record<string, number> = {};
    const prev: Record<string, string | null> = {};
    const visited: string[] = [];
    let pq: { id: string; dist: number }[] = [];

    for (const node of input.nodes) {
      dist[node.id] = Infinity;
      prev[node.id] = null;
    }

    // Init
    steps.push({
      state: makeState(input, {
        distances: { ...dist },
        previous: { ...prev },
        message: 'Initialize all distances to ∞',
      }),
      activeLines: [0, 1],
      description: 'Initialize all distances to infinity',
      action: 'init',
    });

    // Set start distance to 0
    dist[input.startNodeId] = 0;
    pq.push({ id: input.startNodeId, dist: 0 });

    const startLabel = input.nodes.find((n) => n.id === input.startNodeId)!.label;
    steps.push({
      state: makeState(input, {
        distances: { ...dist },
        previous: { ...prev },
        priorityQueue: [...pq],
        current: input.startNodeId,
        message: `dist[${startLabel}] = 0, add to priority queue`,
      }),
      activeLines: [2, 3],
      description: `Set dist[${startLabel}] = 0, add to PQ`,
      action: 'enqueue',
    });

    while (pq.length > 0) {
      // Extract min
      pq.sort((a, b) => a.dist - b.dist);
      const { id: uId, dist: uDist } = pq.shift()!;
      const uLabel = input.nodes.find((n) => n.id === uId)!.label;

      if (visited.includes(uId)) {
        steps.push({
          state: makeState(input, {
            visited: [...visited],
            current: uId,
            distances: { ...dist },
            previous: { ...prev },
            priorityQueue: [...pq],
            message: `${uLabel} already visited, skip`,
          }),
          activeLines: [5, 6],
          description: `Extract ${uLabel} (dist=${uDist}) — already visited, skip`,
          action: 'dequeue',
        });
        continue;
      }

      // Extract step
      steps.push({
        state: makeState(input, {
          visited: [...visited],
          current: uId,
          distances: { ...dist },
          previous: { ...prev },
          priorityQueue: [...pq],
          message: `Extract ${uLabel} with dist=${uDist}`,
        }),
        activeLines: [4, 5],
        description: `Extract min: ${uLabel} (dist=${uDist})`,
        action: 'dequeue',
      });

      // Visit
      visited.push(uId);
      steps.push({
        state: makeState(input, {
          visited: [...visited],
          current: uId,
          distances: { ...dist },
          previous: { ...prev },
          priorityQueue: [...pq],
          message: `Mark ${uLabel} as visited`,
        }),
        activeLines: [7],
        description: `Visit ${uLabel}`,
        action: 'visit',
      });

      // Relax neighbors
      const neighbors = adj.get(uId) || [];
      for (const { to: vId, weight } of neighbors) {
        if (visited.includes(vId)) continue;
        const vLabel = input.nodes.find((n) => n.id === vId)!.label;
        const newDist = dist[uId] + weight;

        steps.push({
          state: makeState(input, {
            visited: [...visited],
            current: uId,
            distances: { ...dist },
            previous: { ...prev },
            priorityQueue: [...pq],
            currentEdge: [uId, vId],
            message: `Check edge ${uLabel}→${vLabel}: dist[${uLabel}]+${weight} = ${newDist} vs dist[${vLabel}]=${dist[vId] === Infinity ? '∞' : dist[vId]}`,
          }),
          activeLines: [8, 9],
          description: `Check ${uLabel}→${vLabel}: ${dist[uId]}+${weight}=${newDist} vs ${dist[vId] === Infinity ? '∞' : dist[vId]}`,
          action: 'compare',
        });

        if (newDist < dist[vId]) {
          dist[vId] = newDist;
          prev[vId] = uId;
          pq.push({ id: vId, dist: newDist });

          steps.push({
            state: makeState(input, {
              visited: [...visited],
              current: uId,
              distances: { ...dist },
              previous: { ...prev },
              priorityQueue: [...pq],
              relaxedEdge: [uId, vId],
              message: `Relax! dist[${vLabel}] = ${newDist}, prev[${vLabel}] = ${uLabel}`,
            }),
            activeLines: [10, 11, 12],
            description: `Relax: dist[${vLabel}] ← ${newDist}, prev ← ${uLabel}`,
            action: 'set',
          });
        }
      }
    }

    // Build shortest paths from start to all nodes
    steps.push({
      state: makeState(input, {
        visited: [...visited],
        distances: { ...dist },
        previous: { ...prev },
        message: `Done! Shortest distances from ${startLabel} computed`,
      }),
      activeLines: [13],
      description: `Dijkstra complete. All shortest distances from ${startLabel} found`,
      action: 'done',
    });

    return steps;
  },
};

export const DIJKSTRA_PRESET: DijkstraInput = {
  nodes: [
    { id: 'A', label: 'A', x: 0.1, y: 0.3 },
    { id: 'B', label: 'B', x: 0.35, y: 0.1 },
    { id: 'C', label: 'C', x: 0.35, y: 0.55 },
    { id: 'D', label: 'D', x: 0.65, y: 0.1 },
    { id: 'E', label: 'E', x: 0.65, y: 0.55 },
    { id: 'F', label: 'F', x: 0.9, y: 0.3 },
  ],
  edges: [
    { from: 'A', to: 'B', weight: 4 },
    { from: 'A', to: 'C', weight: 2 },
    { from: 'B', to: 'D', weight: 5 },
    { from: 'B', to: 'C', weight: 1 },
    { from: 'C', to: 'E', weight: 8 },
    { from: 'D', to: 'F', weight: 2 },
    { from: 'D', to: 'E', weight: 1 },
    { from: 'E', to: 'F', weight: 3 },
  ],
  startNodeId: 'A',
  directed: false,
};
