import { useEffect, useRef } from 'react';
import { useVisualizerStore } from '../../stores/visualizer-store';
import { useAlgorithmPlayer } from '../../hooks/useAlgorithmPlayer';
import { BarChart } from './BarChart';
import { MergeSortChart } from './MergeSortChart';
import { HeapSortChart } from './HeapSortChart';
import { PseudocodePanel } from './PseudocodePanel';
import { ControlBar } from './ControlBar';
import { ComplexityPanel } from './ComplexityPanel';
import { InputControls } from './InputControls';
import { ColorLegend } from '../ui/ColorLegend';
import { ActionBadge } from '../ui/ActionBadge';
import type { Algorithm } from '../../algorithms/types';
import type { SortingBarState } from '../../algorithms/sorting/types';
import { DEFAULT_ARRAY } from '../../lib/constants';

const SORTING_LEGEND = [
  { color: 'var(--color-highlight)', label: 'Comparing' },
  { color: 'var(--color-accent)', label: 'Swapping' },
  { color: 'var(--color-accent-secondary)', label: 'Active / Shifting' },
  { color: 'var(--color-success)', label: 'Sorted / Pivot' },
];

interface SortingVisualizerProps {
  algorithm: Algorithm<SortingBarState>;
  defaultArray?: number[];
}

export function SortingVisualizer({ algorithm, defaultArray = DEFAULT_ARRAY }: SortingVisualizerProps) {
  const steps = useVisualizerStore((s) => s.steps);
  const currentStepIndex = useVisualizerStore((s) => s.currentStepIndex);
  const loadAlgorithm = useVisualizerStore((s) => s.loadAlgorithm);
  const initialized = useRef(false);

  useAlgorithmPlayer();

  // Load initial steps synchronously on first render to avoid "Loading..." flash
  if (!initialized.current) {
    initialized.current = true;
    const initialSteps = algorithm.generateSteps(defaultArray);
    loadAlgorithm(initialSteps, algorithm.meta, defaultArray);
  }

  // Re-load if algorithm or array changes after mount
  useEffect(() => {
    const initialSteps = algorithm.generateSteps(defaultArray);
    loadAlgorithm(initialSteps, algorithm.meta, defaultArray);
  }, [algorithm, defaultArray, loadAlgorithm]);

  const handleNewInput = (arr: number[]) => {
    const newSteps = algorithm.generateSteps(arr);
    loadAlgorithm(newSteps, algorithm.meta, arr);
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
      {/* Algorithm title + input controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="font-display text-3xl tracking-wide text-[var(--color-text)]">
          {algorithm.meta.name}
        </h1>
        <InputControls onApply={handleNewInput} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Visualization area */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Color legend */}
          <ColorLegend items={SORTING_LEGEND} />

          <div className="flex-1 min-h-0">
            {algorithm.meta.slug === 'merge-sort' ? (
              <MergeSortChart state={currentStep.state as SortingBarState} />
            ) : algorithm.meta.slug === 'heap-sort' ? (
              <HeapSortChart state={currentStep.state as SortingBarState} />
            ) : (
              <BarChart state={currentStep.state as SortingBarState} />
            )}
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
