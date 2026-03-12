import { useEffect, useRef } from 'react';
import { useVisualizerStore } from '../../stores/visualizer-store';
import { useAlgorithmPlayer } from '../../hooks/useAlgorithmPlayer';
import { GraphChart } from './GraphChart';
import { FrontierPanel } from './FrontierPanel';
import { PseudocodePanel } from './PseudocodePanel';
import { ControlBar } from './ControlBar';
import { ComplexityPanel } from './ComplexityPanel';
import { GraphInputControls } from './GraphInputControls';
import { ColorLegend } from '../ui/ColorLegend';
import { ActionBadge } from '../ui/ActionBadge';
import type { Algorithm } from '../../algorithms/types';
import type { GraphState, GraphInput } from '../../algorithms/graph/types';
import { graphPresets } from '../../lib/graph-presets';

const DEFAULT_PRESET = 'small';

const GRAPH_LEGEND = [
  { color: 'var(--color-accent)', label: 'Current / Visiting' },
  { color: 'var(--color-highlight)', label: 'In Frontier' },
  { color: 'var(--color-accent-secondary)', label: 'Visited' },
];

interface GraphVisualizerProps {
  algorithm: Algorithm<GraphState, GraphInput>;
  defaultPreset?: string;
}

export function GraphVisualizer({ algorithm, defaultPreset }: GraphVisualizerProps) {
  const steps = useVisualizerStore((s) => s.steps);
  const currentStepIndex = useVisualizerStore((s) => s.currentStepIndex);
  const loadAlgorithm = useVisualizerStore((s) => s.loadAlgorithm);
  const initialized = useRef(false);
  const presetKey = defaultPreset || DEFAULT_PRESET;

  useAlgorithmPlayer();

  // Load initial steps synchronously on first render to avoid "Loading..." flash
  if (!initialized.current) {
    initialized.current = true;
    const preset = graphPresets[presetKey];
    const initialSteps = algorithm.generateSteps(preset);
    loadAlgorithm(initialSteps, algorithm.meta, []);
  }

  // Re-load if algorithm changes after mount
  useEffect(() => {
    const preset = graphPresets[presetKey];
    const initialSteps = algorithm.generateSteps(preset);
    loadAlgorithm(initialSteps, algorithm.meta, []);
  }, [algorithm, loadAlgorithm]);

  const handleNewInput = (input: GraphInput) => {
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

  const graphState = currentStep.state as GraphState;
  const frontierLabel = algorithm.meta.slug.includes('bfs') ? 'Queue' : 'Stack';

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col p-6 gap-4">
      {/* Algorithm title + input controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="font-display text-3xl tracking-wide text-[var(--color-text)]">
          {algorithm.meta.name}
        </h1>
        <GraphInputControls onApply={handleNewInput} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Visualization area */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Color legend */}
          <ColorLegend items={GRAPH_LEGEND} />

          <div className="flex-1 min-h-0">
            <GraphChart state={graphState} />
          </div>

          {/* Frontier panel */}
          <FrontierPanel items={graphState.frontier} label={frontierLabel} />

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
