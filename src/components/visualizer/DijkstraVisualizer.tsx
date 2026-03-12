import { useEffect, useRef } from 'react';
import { useVisualizerStore } from '../../stores/visualizer-store';
import { useAlgorithmPlayer } from '../../hooks/useAlgorithmPlayer';
import { DijkstraChart } from './DijkstraChart';
import { PseudocodePanel } from './PseudocodePanel';
import { ControlBar } from './ControlBar';
import { ComplexityPanel } from './ComplexityPanel';
import { ColorLegend } from '../ui/ColorLegend';
import { ActionBadge } from '../ui/ActionBadge';
import type { Algorithm } from '../../algorithms/types';
import type { DijkstraState, DijkstraInput } from '../../algorithms/graph/dijkstra-types';
import { DIJKSTRA_PRESET } from '../../algorithms/graph/dijkstra';

const LEGEND = [
  { color: 'var(--color-accent)', label: 'Current' },
  { color: 'var(--color-highlight)', label: 'In Priority Queue' },
  { color: 'var(--color-accent-secondary)', label: 'Visited' },
  { color: 'var(--color-success)', label: 'Relaxed Edge' },
];

interface DijkstraVisualizerProps {
  algorithm: Algorithm<DijkstraState, DijkstraInput>;
}

export function DijkstraVisualizer({ algorithm }: DijkstraVisualizerProps) {
  const steps = useVisualizerStore((s) => s.steps);
  const currentStepIndex = useVisualizerStore((s) => s.currentStepIndex);
  const loadAlgorithm = useVisualizerStore((s) => s.loadAlgorithm);
  const initialized = useRef(false);

  useAlgorithmPlayer();

  if (!initialized.current) {
    initialized.current = true;
    const initialSteps = algorithm.generateSteps(DIJKSTRA_PRESET);
    loadAlgorithm(initialSteps, algorithm.meta, []);
  }

  useEffect(() => {
    const initialSteps = algorithm.generateSteps(DIJKSTRA_PRESET);
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

  const state = currentStep.state as DijkstraState;

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col p-6 gap-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="font-display text-3xl tracking-wide text-[var(--color-text)]">
          {algorithm.meta.name}
        </h1>
        {/* Priority queue display */}
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-text-muted)]">
          <span>PQ:</span>
          {state.priorityQueue.length > 0 ? (
            state.priorityQueue
              .sort((a, b) => a.dist - b.dist)
              .map((item, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)]">
                  {item.id}:{item.dist}
                </span>
              ))
          ) : (
            <span className="opacity-50">empty</span>
          )}
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <ColorLegend items={LEGEND} />
          <div className="flex-1 min-h-0">
            <DijkstraChart state={state} />
          </div>
          {/* Distance table */}
          <div className="flex items-center gap-2 text-xs font-mono flex-wrap">
            {state.nodes.map((n) => {
              const d = state.distances[n.id];
              return (
                <span key={n.id} className="px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)]">
                  <span className="text-[var(--color-text-muted)]">{n.label}:</span>
                  <span className="ml-1 text-[var(--color-text)] font-bold">
                    {d === undefined || d === Infinity ? '∞' : d}
                  </span>
                </span>
              );
            })}
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
