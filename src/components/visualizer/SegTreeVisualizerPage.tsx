import { useState } from 'react';
import { SegTreeVisualizer } from './SegTreeVisualizer';
import { AlgoIntro } from '../ui/AlgoIntro';
import { segTree } from '../../algorithms/tree/seg-tree';

export function SegTreeVisualizerPage() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <>
      {showIntro && (
        <AlgoIntro
          slug="seg-tree"
          name={segTree.meta.name}
          onDismiss={() => setShowIntro(false)}
        />
      )}
      <SegTreeVisualizer algorithm={segTree} />
    </>
  );
}
