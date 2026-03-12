import { useEffect, useRef } from 'react';
import { useVisualizerStore } from '../../stores/visualizer-store';
import { useAlgorithmPlayer } from '../../hooks/useAlgorithmPlayer';
import { SegTreeChart } from './SegTreeChart';
import { PseudocodePanel } from './PseudocodePanel';
import { ControlBar } from './ControlBar';
import { ComplexityPanel } from './ComplexityPanel';
import { ColorLegend } from '../ui/ColorLegend';
import { ActionBadge } from '../ui/ActionBadge';
import type { Algorithm } from '../../algorithms/types';
import type { SegTreeState, SegTreeInput } from '../../algorithms/tree/seg-tree-types';
import { DEFAULT_SEG_TREE_INPUT } from '../../algorithms/tree/seg-tree';

const SEG_LEGEND = [
  { color: 'var(--color-surface)', label: 'Node' },
  { color: 'var(--color-accent)', label: 'Visiting' },
  { color: 'var(--color-accent-secondary)', label: 'In Range' },
  { color: 'var(--color-warning, #e67e22)', label: 'Updating' },
  { color: 'var(--color-success)', label: 'Result' },
];

interface SegTreeVisualizerProps {
  algorithm: Algorithm<SegTreeState, SegTreeInput>;
}

export function SegTreeVisualizer({ algorithm }: SegTreeVisualizerProps) {
  const steps = useVisualizerStore((s) => s.steps);
  const currentStepIndex = useVisualizerStore((s) => s.currentStepIndex);
  const loadAlgorithm = useVisualizerStore((s) => s.loadAlgorithm);
  const initialized = useRef(false);

  useAlgorithmPlayer();

  if (!initialized.current) {
    initialized.current = true;
    const initialSteps = algorithm.generateSteps(DEFAULT_SEG_TREE_INPUT);
    loadAlgorithm(initialSteps, algorithm.meta, []);
  }

  useEffect(() => {
    const initialSteps = algorithm.generateSteps(DEFAULT_SEG_TREE_INPUT);
    loadAlgorithm(initialSteps, algorithm.meta, []);
  }, [algorithm, loadAlgorithm]);

  const currentStep = steps[currentStepIndex];
  if (!currentStep) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <p className="text-[var(--color-text-muted)] font-mono text-sm animate-pulse">Loading...</p>
      </div>
    );
  }

  const state = currentStep.state as SegTreeState;

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col p-6 gap-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="font-display text-3xl tracking-wide text-[var(--color-text)]">
          {algorithm.meta.name}
        </h1>
        {state.queryRange && (
          <span className="font-mono text-sm text-[var(--color-accent-secondary)]">
            Query range: [{state.queryRange[0]}, {state.queryRange[1]}]
            {state.queryResult !== null && ` = ${state.queryResult}`}
          </span>
        )}
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <ColorLegend items={SEG_LEGEND} />
          <div className="flex-1 min-h-0">
            <SegTreeChart state={state} />
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
