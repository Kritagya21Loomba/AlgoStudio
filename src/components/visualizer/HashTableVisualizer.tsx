import { useEffect, useRef } from 'react';
import { useVisualizerStore } from '../../stores/visualizer-store';
import { useAlgorithmPlayer } from '../../hooks/useAlgorithmPlayer';
import { HashTableChart } from './HashTableChart';
import { PseudocodePanel } from './PseudocodePanel';
import { ControlBar } from './ControlBar';
import { ComplexityPanel } from './ComplexityPanel';
import { HashTableInputControls } from './HashTableInputControls';
import { ColorLegend } from '../ui/ColorLegend';
import { ActionBadge } from '../ui/ActionBadge';
import type { Algorithm } from '../../algorithms/types';
import type { HashTableState, HashTableInput } from '../../algorithms/hashing/types';
import { DEFAULT_HASH_LINEAR_INPUT } from '../../algorithms/hashing/linear-probing';
import { DEFAULT_HASH_QUADRATIC_INPUT } from '../../algorithms/hashing/quadratic-probing';

const HASH_LEGEND = [
  { color: 'var(--color-surface)', label: 'Empty' },
  { color: 'var(--color-accent-secondary)', label: 'Occupied' },
  { color: 'var(--color-highlight)', label: 'Probing' },
  { color: 'var(--color-danger, #ef4444)', label: 'Collision' },
  { color: 'var(--color-success)', label: 'Inserted' },
];

interface HashTableVisualizerProps {
  algorithm: Algorithm<HashTableState, HashTableInput>;
}

export function HashTableVisualizer({ algorithm }: HashTableVisualizerProps) {
  const steps = useVisualizerStore((s) => s.steps);
  const currentStepIndex = useVisualizerStore((s) => s.currentStepIndex);
  const loadAlgorithm = useVisualizerStore((s) => s.loadAlgorithm);
  const initialized = useRef(false);

  const strategy = algorithm.meta.slug.includes('quadratic') ? 'quadratic' : 'linear';
  const defaultInput = strategy === 'quadratic' ? DEFAULT_HASH_QUADRATIC_INPUT : DEFAULT_HASH_LINEAR_INPUT;

  useAlgorithmPlayer();

  // Sync init to avoid Loading flash
  if (!initialized.current) {
    initialized.current = true;
    const initialSteps = algorithm.generateSteps(defaultInput);
    loadAlgorithm(initialSteps, algorithm.meta, defaultInput.keys);
  }

  useEffect(() => {
    const initialSteps = algorithm.generateSteps(defaultInput);
    loadAlgorithm(initialSteps, algorithm.meta, defaultInput.keys);
  }, [algorithm, loadAlgorithm]);

  const handleNewInput = (input: HashTableInput) => {
    if (input.keys.length === 0) {
      // Reset: empty table
      const emptyInput: HashTableInput = { keys: [], tableSize: input.tableSize, strategy };
      const newSteps = algorithm.generateSteps(emptyInput);
      loadAlgorithm(newSteps, algorithm.meta, []);
      return;
    }

    // For single key insert, we accumulate on existing state
    // For random/multi-key, we generate fresh
    const newSteps = algorithm.generateSteps(input);
    loadAlgorithm(newSteps, algorithm.meta, input.keys);
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
      {/* Title + input controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="font-display text-3xl tracking-wide text-[var(--color-text)]">
          {algorithm.meta.name}
        </h1>
        <HashTableInputControls onApply={handleNewInput} strategy={strategy} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Visualization */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <ColorLegend items={HASH_LEGEND} />
          <div className="flex-1 min-h-0">
            <HashTableChart state={currentStep.state as HashTableState} />
          </div>
          <ActionBadge action={currentStep.action} description={currentStep.description} />
          <ControlBar />
        </div>

        {/* Right sidebar */}
        <div className="w-72 shrink-0 flex flex-col gap-4 overflow-y-auto">
          <PseudocodePanel />
          <ComplexityPanel />
        </div>
      </div>
    </div>
  );
}
