import { useState } from 'react';
import { UnionFindVisualizer } from './UnionFindVisualizer';
import { AlgoIntro } from '../ui/AlgoIntro';
import { unionFind } from '../../algorithms/union-find/union-find';
import type { Algorithm } from '../../algorithms/types';
import type { UnionFindState, UnionFindInput } from '../../algorithms/union-find/types';

const algorithmMap: Record<string, Algorithm<UnionFindState, UnionFindInput>> = {
  'union-find': unionFind,
};

interface UnionFindVisualizerPageProps {
  algorithmSlug: string;
}

export function UnionFindVisualizerPage({ algorithmSlug }: UnionFindVisualizerPageProps) {
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
      <UnionFindVisualizer key={algorithmSlug} algorithm={algorithm} />
    </>
  );
}
