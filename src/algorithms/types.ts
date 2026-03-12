/** A single snapshot of algorithm state at one point in execution */
export interface AlgorithmStep<TState> {
  /** The complete state to render at this step */
  state: TState;
  /** Which line(s) of pseudocode are active (0-indexed) */
  activeLines: number[];
  /** Human-readable description of what happened */
  description: string;
  /** Classification of what this step does */
  action:
    | 'compare' | 'swap' | 'shift' | 'set' | 'done' | 'init'
    | 'partition' | 'merge'
    | 'found' | 'eliminate'
    | 'visit' | 'enqueue' | 'dequeue' | 'push' | 'pop'
    | 'insert' | 'delete' | 'highlight'
    | 'rotate-left' | 'rotate-right' | 'balance-check'
    | 'probe' | 'hash' | 'collision'
    | 'find' | 'union' | 'compress'
    | 'relax' | 'recolor'
    | 'query' | 'update'
    | 'match' | 'mismatch' | 'shift-pattern';
}

export interface AlgorithmMeta {
  name: string;
  slug: string;
  category: 'sorting' | 'searching' | 'graph' | 'tree' | 'hashing' | 'union-find' | 'string';
  complexity: {
    time: { best: string; average: string; worst: string };
    space: string;
  };
  stable?: boolean;
  pseudocode: string[];
}

export interface Algorithm<TState, TInput = number[]> {
  meta: AlgorithmMeta;
  /** Generate all steps from the given input */
  generateSteps(input: TInput): AlgorithmStep<TState>[];
}
