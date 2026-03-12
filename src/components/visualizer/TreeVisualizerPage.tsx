import { useState } from 'react';
import { TreeVisualizer } from './TreeVisualizer';
import { AlgoIntro } from '../ui/AlgoIntro';
import { bst } from '../../algorithms/tree/bst';
import type { Algorithm } from '../../algorithms/types';
import type { BSTState, BSTInput } from '../../algorithms/tree/types';

const algorithmMap: Record<string, Algorithm<BSTState, BSTInput>> = {
  'bst': bst,
};

interface TreeVisualizerPageProps {
  algorithmSlug: string;
}

export function TreeVisualizerPage({ algorithmSlug }: TreeVisualizerPageProps) {
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
        <AlgoIntro
          slug={algorithmSlug}
          name={algorithm.meta.name}
          onDismiss={() => setShowIntro(false)}
        />
      )}
      <TreeVisualizer key={algorithmSlug} algorithm={algorithm} />
    </>
  );
}
