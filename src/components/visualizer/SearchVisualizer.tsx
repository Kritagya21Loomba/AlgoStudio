import { useEffect, useRef } from 'react';
import { useVisualizerStore } from '../../stores/visualizer-store';
import { useAlgorithmPlayer } from '../../hooks/useAlgorithmPlayer';
import { SearchBarChart } from './SearchBarChart';
import { PseudocodePanel } from './PseudocodePanel';
import { ControlBar } from './ControlBar';
import { ComplexityPanel } from './ComplexityPanel';
import { SearchInputControls } from './SearchInputControls';
import { ColorLegend } from '../ui/ColorLegend';
import { ActionBadge } from '../ui/ActionBadge';
import type { Algorithm } from '../../algorithms/types';
import type { SearchBarState, SearchInput } from '../../algorithms/searching/types';

const DEFAULT_VALUES = [2, 5, 8, 11, 15, 19, 22, 27, 33, 40];
const DEFAULT_TARGET = 22;

const SEARCH_LEGEND = [
  { color: 'var(--color-accent-secondary)', label: 'Search Range' },
  { color: 'var(--color-highlight)', label: 'Mid (checking)' },
  { color: 'var(--color-accent)', label: 'Target Line' },
  { color: 'var(--color-success)', label: 'Found' },
];

interface SearchVisualizerProps {
  algorithm: Algorithm<SearchBarState, SearchInput>;
}

export function SearchVisualizer({ algorithm }: SearchVisualizerProps) {
  const steps = useVisualizerStore((s) => s.steps);
  const currentStepIndex = useVisualizerStore((s) => s.currentStepIndex);
  const loadAlgorithm = useVisualizerStore((s) => s.loadAlgorithm);
  const initialized = useRef(false);

  useAlgorithmPlayer();

  // Load initial steps synchronously on first render to avoid "Loading..." flash
  if (!initialized.current) {
    initialized.current = true;
    const input: SearchInput = { values: DEFAULT_VALUES, target: DEFAULT_TARGET };
    const initialSteps = algorithm.generateSteps(input);
    loadAlgorithm(initialSteps, algorithm.meta, DEFAULT_VALUES);
  }

  // Re-load if algorithm changes after mount
  useEffect(() => {
    const input: SearchInput = { values: DEFAULT_VALUES, target: DEFAULT_TARGET };
    const initialSteps = algorithm.generateSteps(input);
    loadAlgorithm(initialSteps, algorithm.meta, DEFAULT_VALUES);
  }, [algorithm, loadAlgorithm]);

  const handleNewInput = (input: SearchInput) => {
    const newSteps = algorithm.generateSteps(input);
    loadAlgorithm(newSteps, algorithm.meta, input.values);
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
        <SearchInputControls onApply={handleNewInput} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Visualization area */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Color legend */}
          <ColorLegend items={SEARCH_LEGEND} />

          <div className="flex-1 min-h-0">
            <SearchBarChart state={currentStep.state as SearchBarState} />
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
