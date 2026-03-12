import type { GraphNode } from './types';

export interface WeightedEdge {
  from: string;
  to: string;
  weight: number;
}

export interface DijkstraInput {
  nodes: GraphNode[];
  edges: WeightedEdge[];
  startNodeId: string;
  directed?: boolean;
}

export interface DijkstraState {
  nodes: GraphNode[];
  edges: WeightedEdge[];
  visited: string[];
  current: string | null;
  distances: Record<string, number>;
  previous: Record<string, string | null>;
  priorityQueue: { id: string; dist: number }[];
  currentEdge: [string, string] | null;
  relaxedEdge: [string, string] | null;
  shortestPath: string[];
  message: string;
}
