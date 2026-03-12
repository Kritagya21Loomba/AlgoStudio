import { useState } from 'react';
import { RBVisualizer } from './RBVisualizer';
import { AlgoIntro } from '../ui/AlgoIntro';
import { rbTree } from '../../algorithms/tree/rb-tree';

export function RBVisualizerPage() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <>
      {showIntro && (
        <AlgoIntro
          slug="rb-tree"
          name={rbTree.meta.name}
          onDismiss={() => setShowIntro(false)}
        />
      )}
      <RBVisualizer algorithm={rbTree} />
    </>
  );
}
