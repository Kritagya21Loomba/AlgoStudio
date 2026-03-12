import { useState } from 'react';
import { SearchVisualizer } from './SearchVisualizer';
import { AlgoIntro } from '../ui/AlgoIntro';
import { binarySearch } from '../../algorithms/searching/binary-search';
import type { Algorithm } from '../../algorithms/types';
import type { SearchBarState, SearchInput } from '../../algorithms/searching/types';

const algorithmMap: Record<string, Algorithm<SearchBarState, SearchInput>> = {
  'binary-search': binarySearch,
};

interface SearchVisualizerPageProps {
  algorithmSlug: string;
}

export function SearchVisualizerPage({ algorithmSlug }: SearchVisualizerPageProps) {
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
      <SearchVisualizer key={algorithmSlug} algorithm={algorithm} />
    </>
  );
}
