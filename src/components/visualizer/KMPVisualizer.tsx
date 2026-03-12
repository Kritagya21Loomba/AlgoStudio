import { useEffect, useRef } from 'react';
import { useVisualizerStore } from '../../stores/visualizer-store';
import { useAlgorithmPlayer } from '../../hooks/useAlgorithmPlayer';
import { KMPChart } from './KMPChart';
import { KMPInputControls } from './KMPInputControls';
import { PseudocodePanel } from './PseudocodePanel';
import { ControlBar } from './ControlBar';
import { ComplexityPanel } from './ComplexityPanel';
import { ActionBadge } from '../ui/ActionBadge';
import { ColorLegend } from '../ui/ColorLegend';
import { kmp, DEFAULT_KMP_INPUT } from '../../algorithms/string/kmp';
import type { KMPState, KMPInput } from '../../algorithms/string/types';

const KMP_LEGEND = [
  { color: 'var(--color-accent)', label: 'Match' },
  { color: 'var(--color-error, #e74c3c)', label: 'Mismatch' },
  { color: 'var(--color-success)', label: 'Found Match' },
  { color: 'var(--color-highlight)', label: 'LPS Building' },
];

export function KMPVisualizer() {
  const steps = useVisualizerStore((s) => s.steps);
  const currentStepIndex = useVisualizerStore((s) => s.currentStepIndex);
  const loadAlgorithm = useVisualizerStore((s) => s.loadAlgorithm);
  const initialized = useRef(false);

  useAlgorithmPlayer();

  if (!initialized.current) {
    initialized.current = true;
    const initialSteps = kmp.generateSteps(DEFAULT_KMP_INPUT);
    loadAlgorithm(initialSteps, kmp.meta, []);
  }

  useEffect(() => {
    const initialSteps = kmp.generateSteps(DEFAULT_KMP_INPUT);
    loadAlgorithm(initialSteps, kmp.meta, []);
  }, [loadAlgorithm]);

  const handleNewInput = (input: KMPInput) => {
    const newSteps = kmp.generateSteps(input);
    loadAlgorithm(newSteps, kmp.meta, []);
  };

  const currentStep = steps[currentStepIndex];
  if (!currentStep) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <p className="text-[var(--color-text-muted)] font-mono text-sm animate-pulse">Loading...</p>
      </div>
    );
  }

  const kmpState = currentStep.state as KMPState;

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col p-6 gap-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="font-display text-3xl tracking-wide text-[var(--color-text)]">
          KMP String Search
        </h1>
        <KMPInputControls onApply={handleNewInput} />
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <ColorLegend items={KMP_LEGEND} />

          <div className="flex-1 min-h-0">
            <KMPChart state={kmpState} />
          </div>

          <ActionBadge
            action={currentStep.action}
            description={currentStep.description}
          />

          <ControlBar />
        </div>

        <div className="w-72 shrink-0 flex flex-col gap-4 overflow-y-auto">
          <PseudocodePanel />
          <ComplexityPanel />
        </div>
      </div>
    </div>
  );
}
