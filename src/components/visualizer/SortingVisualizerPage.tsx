import { useState } from 'react';
import { SortingVisualizer } from './SortingVisualizer';
import { AlgoIntro } from '../ui/AlgoIntro';
import { bubbleSort } from '../../algorithms/sorting/bubble-sort';
import { insertionSort } from '../../algorithms/sorting/insertion-sort';
import { selectionSort } from '../../algorithms/sorting/selection-sort';
import { mergeSort } from '../../algorithms/sorting/merge-sort';
import { quickSort } from '../../algorithms/sorting/quick-sort';
import { heapSort } from '../../algorithms/sorting/heap-sort';
import type { Algorithm } from '../../algorithms/types';
import type { SortingBarState } from '../../algorithms/sorting/types';

const algorithmMap: Record<string, Algorithm<SortingBarState>> = {
  'bubble-sort': bubbleSort,
  'insertion-sort': insertionSort,
  'selection-sort': selectionSort,
  'merge-sort': mergeSort,
  'quick-sort': quickSort,
  'heap-sort': heapSort,
};

interface SortingVisualizerPageProps {
  algorithmSlug: string;
}

export function SortingVisualizerPage({ algorithmSlug }: SortingVisualizerPageProps) {
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
      <SortingVisualizer key={algorithmSlug} algorithm={algorithm} />
    </>
  );
}
