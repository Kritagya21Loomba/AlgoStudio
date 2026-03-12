import { useEffect, useRef } from 'react';
import { useVisualizerStore } from '../../stores/visualizer-store';
import { useAlgorithmPlayer } from '../../hooks/useAlgorithmPlayer';
import { UnionFindChart } from './UnionFindChart';
import { PseudocodePanel } from './PseudocodePanel';
import { ControlBar } from './ControlBar';
import { ComplexityPanel } from './ComplexityPanel';
import { UnionFindInputControls } from './UnionFindInputControls';
import { ColorLegend } from '../ui/ColorLegend';
import { ActionBadge } from '../ui/ActionBadge';
import type { Algorithm } from '../../algorithms/types';
import type { UnionFindState, UnionFindInput } from '../../algorithms/union-find/types';
import { DEFAULT_UF_OPERATIONS } from '../../algorithms/union-find/union-find';

const UF_LEGEND = [
  { color: 'var(--color-highlight)', label: 'Highlighted' },
  { color: 'var(--color-accent)', label: 'Compressing' },
  { color: 'var(--color-success)', label: 'Just Unioned' },
];

interface UnionFindVisualizerProps {
  algorithm: Algorithm<UnionFindState, UnionFindInput>;
}

export function UnionFindVisualizer({ algorithm }: UnionFindVisualizerProps) {
  const steps = useVisualizerStore((s) => s.steps);
  const currentStepIndex = useVisualizerStore((s) => s.currentStepIndex);
  const loadAlgorithm = useVisualizerStore((s) => s.loadAlgorithm);
  const initialized = useRef(false);

  useAlgorithmPlayer();

  if (!initialized.current) {
    initialized.current = true;
    const initialSteps = algorithm.generateSteps(DEFAULT_UF_OPERATIONS);
    loadAlgorithm(initialSteps, algorithm.meta, []);
  }

  useEffect(() => {
    const initialSteps = algorithm.generateSteps(DEFAULT_UF_OPERATIONS);
    loadAlgorithm(initialSteps, algorithm.meta, []);
  }, [algorithm, loadAlgorithm]);

  const handleNewInput = (input: UnionFindInput) => {
    if (input.operations.length === 0) {
      // Reset
      const resetInput: UnionFindInput = { n: input.n, operations: [] };
      const newSteps = algorithm.generateSteps(resetInput);
      loadAlgorithm(newSteps, algorithm.meta, []);
      return;
    }

    const newSteps = algorithm.generateSteps(input);
    loadAlgorithm(newSteps, algorithm.meta, []);
  };

  const currentStep = steps[currentStepIndex];
  if (!currentStep) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <p className="text-[var(--color-text-muted)] font-mono text-sm animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col p-6 gap-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="font-display text-3xl tracking-wide text-[var(--color-text)]">
          {algorithm.meta.name}
        </h1>
        <UnionFindInputControls onApply={handleNewInput} elementCount={DEFAULT_UF_OPERATIONS.n} />
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <ColorLegend items={UF_LEGEND} />
          <div className="flex-1 min-h-0">
            <UnionFindChart state={currentStep.state as UnionFindState} />
          </div>
          <ActionBadge action={currentStep.action} description={currentStep.description} />
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
