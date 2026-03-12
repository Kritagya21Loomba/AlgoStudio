import { useState } from 'react';
import { DijkstraVisualizer } from './DijkstraVisualizer';
import { AlgoIntro } from '../ui/AlgoIntro';
import { dijkstra } from '../../algorithms/graph/dijkstra';
import type { Algorithm } from '../../algorithms/types';
import type { DijkstraState, DijkstraInput } from '../../algorithms/graph/dijkstra-types';

const algorithmMap: Record<string, Algorithm<DijkstraState, DijkstraInput>> = {
  'dijkstra': dijkstra,
};

interface Props {
  algorithmSlug: string;
}

export function DijkstraVisualizerPage({ algorithmSlug }: Props) {
  const algorithm = algorithmMap[algorithmSlug];
  const [showIntro, setShowIntro] = useState(true);

  if (!algorithm) {
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
        <AlgoIntro slug={algorithmSlug} name={algorithm.meta.name} onDismiss={() => setShowIntro(false)} />
      )}
      <DijkstraVisualizer key={algorithmSlug} algorithm={algorithm} />
    </>
  );
}
