import { useState } from 'react';
import { AVLVisualizer } from './AVLVisualizer';
import { AlgoIntro } from '../ui/AlgoIntro';
import { avl } from '../../algorithms/tree/avl';
import type { Algorithm } from '../../algorithms/types';
import type { AVLState, AVLInput } from '../../algorithms/tree/avl-types';

const algorithmMap: Record<string, Algorithm<AVLState, AVLInput>> = {
  'avl': avl,
};

interface AVLVisualizerPageProps {
  algorithmSlug: string;
}

export function AVLVisualizerPage({ algorithmSlug }: AVLVisualizerPageProps) {
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
      <AVLVisualizer key={algorithmSlug} algorithm={algorithm} />
    </>
  );
}
