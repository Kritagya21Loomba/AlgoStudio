import { useEffect, useState, useCallback, useRef } from 'react';
import { useVisualizerStore } from '../../stores/visualizer-store';
import { useAlgorithmPlayer } from '../../hooks/useAlgorithmPlayer';
import { AVLChart } from './AVLChart';
import { AVLInputControls } from './AVLInputControls';
import { PseudocodePanel } from './PseudocodePanel';
import { ControlBar } from './ControlBar';
import { ComplexityPanel } from './ComplexityPanel';
import { ColorLegend } from '../ui/ColorLegend';
import { ActionBadge } from '../ui/ActionBadge';
import type { Algorithm } from '../../algorithms/types';
import type { AVLState, AVLInput, AVLOperation } from '../../algorithms/tree/avl-types';
import { DEFAULT_AVL_OPERATIONS } from '../../algorithms/tree/avl';

const AVL_LEGEND = [
  { color: 'var(--color-accent)', label: 'Current Node' },
  { color: 'var(--color-highlight)', label: 'Traversal Path' },
  { color: 'var(--color-success)', label: 'Inserted' },
  { color: 'var(--color-accent)', label: 'Rotating' },
  { color: 'var(--color-accent)', label: 'Unbalanced' },
];

interface AVLVisualizerProps {
  algorithm: Algorithm<AVLState, AVLInput>;
}

function generateRandomInserts(count: number): AVLOperation[] {
  const values = new Set<number>();
  while (values.size < count) {
    values.add(Math.floor(Math.random() * 100) + 1);
  }
  return Array.from(values).map((v) => ({ type: 'insert' as const, value: v }));
}

export function AVLVisualizer({ algorithm }: AVLVisualizerProps) {
  const steps = useVisualizerStore((s) => s.steps);
  const currentStepIndex = useVisualizerStore((s) => s.currentStepIndex);
  const loadAlgorithm = useVisualizerStore((s) => s.loadAlgorithm);
  const goToStep = useVisualizerStore((s) => s.goToStep);
  const pause = useVisualizerStore((s) => s.pause);

  // Track the accumulated list of operations
  const [operations, setOperations] = useState<AVLOperation[]>([...DEFAULT_AVL_OPERATIONS]);

  // Track step count before adding a new operation, so we can jump to it
  const [prevStepCount, setPrevStepCount] = useState(0);
  const initialized = useRef(false);

  useAlgorithmPlayer();

  // Generate steps from the current operations list
  const regenerateSteps = useCallback(
    (ops: AVLOperation[]) => {
      const newSteps = algorithm.generateSteps({ operations: ops });
      loadAlgorithm(newSteps, algorithm.meta, []);
      return newSteps.length;
    },
    [algorithm, loadAlgorithm],
  );

  // Load default operations synchronously on first render to avoid "Loading..." flash
  if (!initialized.current) {
    initialized.current = true;
    const newSteps = algorithm.generateSteps({ operations: DEFAULT_AVL_OPERATIONS });
    loadAlgorithm(newSteps, algorithm.meta, []);
    // goToStep will be called in the useEffect below
  }

  // Load default operations on mount (also handles re-mount)
  useEffect(() => {
    const totalSteps = regenerateSteps(operations);
    setPrevStepCount(totalSteps);
    // Jump to last step to show the fully-built default tree
    goToStep(totalSteps - 1);
  }, [regenerateSteps]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInsert = (value: number) => {
    pause();
    const currentTotal = steps.length;
    const newOps = [...operations, { type: 'insert' as const, value }];
    setOperations(newOps);
    const newTotal = regenerateSteps(newOps);
    goToStep(Math.max(0, currentTotal - 1));
    setPrevStepCount(newTotal);
  };

  const handleDelete = (value: number) => {
    pause();
    const currentTotal = steps.length;
    const newOps = [...operations, { type: 'delete' as const, value }];
    setOperations(newOps);
    const newTotal = regenerateSteps(newOps);
    goToStep(Math.max(0, currentTotal - 1));
    setPrevStepCount(newTotal);
  };

  const handleRandom = () => {
    pause();
    const randomOps = generateRandomInserts(7);
    setOperations(randomOps);
    regenerateSteps(randomOps);
    setPrevStepCount(0);
    goToStep(0);
  };

  const handleReset = () => {
    pause();
    setOperations([]);
    regenerateSteps([]);
    setPrevStepCount(0);
    goToStep(0);
  };

  const currentStep = steps[currentStepIndex];
  if (!currentStep) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <p className="text-[var(--color-text-muted)] font-mono text-sm animate-pulse">Loading...</p>
      </div>
    );
  }

  const avlState = currentStep.state as AVLState;

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col p-6 gap-4">
      {/* Algorithm title + input controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="font-display text-3xl tracking-wide text-[var(--color-text)]">
          {algorithm.meta.name}
        </h1>
        <AVLInputControls
          onInsert={handleInsert}
          onDelete={handleDelete}
          onRandom={handleRandom}
          onReset={handleReset}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Visualization area */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Color legend */}
          <ColorLegend items={AVL_LEGEND} />

          <div className="flex-1 min-h-0 overflow-auto">
            <AVLChart state={avlState} />
          </div>

          {/* Action badge + description */}
          <ActionBadge
            action={currentStep.action}
            description={currentStep.description}
          />

          {/* Playback controls */}
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
