import { useState } from 'react';
import { KMPVisualizer } from './KMPVisualizer';
import { AlgoIntro } from '../ui/AlgoIntro';

export function KMPVisualizerPage() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <>
      {showIntro && (
        <AlgoIntro
          slug="kmp"
          name="KMP String Search"
          onDismiss={() => setShowIntro(false)}
        />
      )}
      <KMPVisualizer />
    </>
  );
}
