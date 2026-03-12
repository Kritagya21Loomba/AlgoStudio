import { useState } from 'react';
import { HashTableVisualizer } from './HashTableVisualizer';
import { AlgoIntro } from '../ui/AlgoIntro';
import { linearProbing } from '../../algorithms/hashing/linear-probing';
import { quadraticProbing } from '../../algorithms/hashing/quadratic-probing';
import type { Algorithm } from '../../algorithms/types';
import type { HashTableState, HashTableInput } from '../../algorithms/hashing/types';

const algorithmMap: Record<string, Algorithm<HashTableState, HashTableInput>> = {
  'hash-table-linear': linearProbing,
  'hash-table-quadratic': quadraticProbing,
};

interface HashTableVisualizerPageProps {
  algorithmSlug: string;
}

export function HashTableVisualizerPage({ algorithmSlug }: HashTableVisualizerPageProps) {
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
      <HashTableVisualizer key={algorithmSlug} algorithm={algorithm} />
    </>
  );
}
