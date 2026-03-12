import { useEffect, useState, useCallback, useRef } from 'react';
import { useVisualizerStore } from '../../stores/visualizer-store';
import { useAlgorithmPlayer } from '../../hooks/useAlgorithmPlayer';
import { RBChart } from './RBChart';
import { AVLInputControls } from './AVLInputControls';
import { PseudocodePanel } from './PseudocodePanel';
import { ControlBar } from './ControlBar';
import { ComplexityPanel } from './ComplexityPanel';
import { ColorLegend } from '../ui/ColorLegend';
import { ActionBadge } from '../ui/ActionBadge';
import type { Algorithm } from '../../algorithms/types';
import type { RBState, RBInput, RBOperation } from '../../algorithms/tree/rb-types';
import { DEFAULT_RB_OPERATIONS } from '../../algorithms/tree/rb-tree';

const RB_LEGEND = [
  { color: '#dc2626', label: 'Red Node' },
  { color: '#1f2937', label: 'Black Node' },
  { color: 'var(--color-success)', label: 'Inserted' },
  { color: 'var(--color-warning, #e67e22)', label: 'Recolored' },
  { color: 'var(--color-accent)', label: 'Rotating' },
];

interface RBVisualizerProps {
  algorithm: Algorithm<RBState, RBInput>;
}

function generateRandomInserts(count: number): RBOperation[] {
  const values = new Set<number>();
  while (values.size < count) {
    values.add(Math.floor(Math.random() * 100) + 1);
  }
  return Array.from(values).map((v) => ({ type: 'insert' as const, value: v }));
}

export function RBVisualizer({ algorithm }: RBVisualizerProps) {
  const steps = useVisualizerStore((s) => s.steps);
  const currentStepIndex = useVisualizerStore((s) => s.currentStepIndex);
  const loadAlgorithm = useVisualizerStore((s) => s.loadAlgorithm);
  const goToStep = useVisualizerStore((s) => s.goToStep);
  const pause = useVisualizerStore((s) => s.pause);

  const [operations, setOperations] = useState<RBOperation[]>([...DEFAULT_RB_OPERATIONS.operations]);
  const initialized = useRef(false);

  useAlgorithmPlayer();

  const regenerateSteps = useCallback(
    (ops: RBOperation[]) => {
      const newSteps = algorithm.generateSteps({ operations: ops });
      loadAlgorithm(newSteps, algorithm.meta, []);
      return newSteps.length;
    },
    [algorithm, loadAlgorithm],
  );

  if (!initialized.current) {
    initialized.current = true;
    const newSteps = algorithm.generateSteps(DEFAULT_RB_OPERATIONS);
    loadAlgorithm(newSteps, algorithm.meta, []);
  }

  useEffect(() => {
    const totalSteps = regenerateSteps(operations);
    goToStep(totalSteps - 1);
  }, [regenerateSteps]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInsert = (value: number) => {
    pause();
    const currentTotal = steps.length;
    const newOps = [...operations, { type: 'insert' as const, value }];
    setOperations(newOps);
    regenerateSteps(newOps);
    goToStep(Math.max(0, currentTotal - 1));
  };

  const handleDelete = (_value: number) => {
    // RB delete is complex; not implemented yet — no-op
  };

  const handleRandom = () => {
    pause();
    const randomOps = generateRandomInserts(7);
    setOperations(randomOps);
    regenerateSteps(randomOps);
    goToStep(0);
  };

  const handleReset = () => {
    pause();
    setOperations([]);
    regenerateSteps([]);
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

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col p-6 gap-4">
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

      <div className="flex-1 flex gap-6 min-h-0">
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <ColorLegend items={RB_LEGEND} />
          <div className="flex-1 min-h-0 overflow-auto">
            <RBChart state={currentStep.state as RBState} />
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
