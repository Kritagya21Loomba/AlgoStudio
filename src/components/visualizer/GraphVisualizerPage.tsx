import { useState } from 'react';
import { GraphVisualizer } from './GraphVisualizer';
import { AlgoIntro } from '../ui/AlgoIntro';
import { bfs } from '../../algorithms/graph/bfs';
import { dfs } from '../../algorithms/graph/dfs';
import { topoSort } from '../../algorithms/graph/topo-sort';
import type { Algorithm } from '../../algorithms/types';
import type { GraphState, GraphInput } from '../../algorithms/graph/types';

const algorithmMap: Record<string, { algo: Algorithm<GraphState, GraphInput>; preset?: string }> = {
  'bfs': { algo: bfs },
  'dfs': { algo: dfs },
  'topo-sort': { algo: topoSort, preset: 'dag' },
};

interface GraphVisualizerPageProps {
  algorithmSlug: string;
}

export function GraphVisualizerPage({ algorithmSlug }: GraphVisualizerPageProps) {
  const entry = algorithmMap[algorithmSlug];
  const [showIntro, setShowIntro] = useState(true);

  if (!entry) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]">
        <p className="text-[var(--color-text-muted)] font-mono text-sm">
          Algorithm &quot;{algorithmSlug}&quot; not found.
        </p>
      </div>
    );
  }

  return (
    <>
      {showIntro && (
        <AlgoIntro
          slug={algorithmSlug}
          name={entry.algo.meta.name}
          onDismiss={() => setShowIntro(false)}
        />
      )}
      <GraphVisualizer key={algorithmSlug} algorithm={entry.algo} defaultPreset={entry.preset} />
    </>
  );
}
