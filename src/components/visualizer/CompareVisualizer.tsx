import { useState, useRef, useEffect } from 'react';
import { useCompareStore } from '../../stores/compare-store';
import { useComparePlayer } from '../../hooks/useComparePlayer';
import { BarChart } from './BarChart';
import { ActionBadge } from '../ui/ActionBadge';
import { Button } from '../ui/Button';
import { bubbleSort } from '../../algorithms/sorting/bubble-sort';
import { insertionSort } from '../../algorithms/sorting/insertion-sort';
import { selectionSort } from '../../algorithms/sorting/selection-sort';
import { mergeSort } from '../../algorithms/sorting/merge-sort';
import { quickSort } from '../../algorithms/sorting/quick-sort';
import { heapSort } from '../../algorithms/sorting/heap-sort';
import type { Algorithm } from '../../algorithms/types';
import type { SortingBarState } from '../../algorithms/sorting/types';
import { ARRAY_VALUE_MIN, ARRAY_VALUE_MAX } from '../../lib/constants';

const ALGORITHMS: Record<string, Algorithm<SortingBarState>> = {
  'Bubble Sort': bubbleSort,
  'Insertion Sort': insertionSort,
  'Selection Sort': selectionSort,
  'Merge Sort': mergeSort,
  'Quick Sort': quickSort,
  'Heap Sort': heapSort,
};

const ALGO_NAMES = Object.keys(ALGORITHMS);

function randomArray(size: number): number[] {
  return Array.from({ length: size }, () =>
    Math.floor(Math.random() * (ARRAY_VALUE_MAX - ARRAY_VALUE_MIN + 1)) + ARRAY_VALUE_MIN
  );
}

export function CompareVisualizer() {
  const [leftAlgo, setLeftAlgo] = useState('Bubble Sort');
  const [rightAlgo, setRightAlgo] = useState('Merge Sort');
  const [size, setSize] = useState(15);

  const left = useCompareStore((s) => s.left);
  const right = useCompareStore((s) => s.right);
  const isPlaying = useCompareStore((s) => s.isPlaying);
  const speed = useCompareStore((s) => s.speed);
  const loadLeft = useCompareStore((s) => s.loadLeft);
  const loadRight = useCompareStore((s) => s.loadRight);
  const setInputArray = useCompareStore((s) => s.setInputArray);
  const togglePlay = useCompareStore((s) => s.togglePlay);
  const stepForward = useCompareStore((s) => s.stepForward);
  const stepBackward = useCompareStore((s) => s.stepBackward);
  const reset = useCompareStore((s) => s.reset);
  const setSpeed = useCompareStore((s) => s.setSpeed);

  useComparePlayer();

  const initialized = useRef(false);

  function loadBoth(arr: number[], lAlgo: string, rAlgo: string) {
    const leftSteps = ALGORITHMS[lAlgo].generateSteps(arr);
    const rightSteps = ALGORITHMS[rAlgo].generateSteps(arr);
    loadLeft(leftSteps, ALGORITHMS[lAlgo].meta);
    loadRight(rightSteps, ALGORITHMS[rAlgo].meta);
    setInputArray(arr);
  }

  if (!initialized.current) {
    initialized.current = true;
    const arr = randomArray(size);
    loadBoth(arr, leftAlgo, rightAlgo);
  }

  const handleNewRandom = () => {
    const arr = randomArray(size);
    loadBoth(arr, leftAlgo, rightAlgo);
  };

  const handleLeftChange = (name: string) => {
    setLeftAlgo(name);
    // Re-run with the same input
    const arr = useCompareStore.getState().inputArray;
    if (arr.length > 0) {
      const steps = ALGORITHMS[name].generateSteps(arr);
      loadLeft(steps, ALGORITHMS[name].meta);
    }
  };

  const handleRightChange = (name: string) => {
    setRightAlgo(name);
    const arr = useCompareStore.getState().inputArray;
    if (arr.length > 0) {
      const steps = ALGORITHMS[name].generateSteps(arr);
      loadRight(steps, ALGORITHMS[name].meta);
    }
  };

  const leftStep = left.steps[left.currentStepIndex];
  const rightStep = right.steps[right.currentStepIndex];

  // Speed labels
  const speedOptions = [
    { label: '0.25x', value: 2000 },
    { label: '0.5x', value: 1000 },
    { label: '1x', value: 500 },
    { label: '2x', value: 250 },
    { label: '4x', value: 125 },
  ];

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col p-6 gap-4">
      {/* Header controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="font-display text-3xl tracking-wide text-[var(--color-text)]">
          Compare Mode
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-mono text-[var(--color-text-muted)]">Size: {size}</span>
          <input
            type="range"
            min={5}
            max={30}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-20 h-1 accent-[var(--color-accent)] cursor-pointer"
          />
          <Button size="sm" onClick={handleNewRandom}>New Random</Button>
          <Button size="sm" variant="ghost" onClick={reset}>Reset</Button>
        </div>
      </div>

      {/* Side-by-side panels */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left panel */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-2">
            <select
              value={leftAlgo}
              onChange={(e) => handleLeftChange(e.target.value)}
              className="h-8 px-3 text-sm font-mono rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] cursor-pointer focus:outline-none focus:border-[var(--color-accent)]"
            >
              {ALGO_NAMES.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <span className="text-xs font-mono text-[var(--color-text-muted)]">
              Step {left.currentStepIndex + 1} / {left.steps.length}
            </span>
          </div>
          <div
            className="flex-1 min-h-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden"
          >
            {leftStep ? (
              <BarChart state={leftStep.state as SortingBarState} instanceId="cmp-left" />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-[var(--color-text-muted)] font-mono text-sm">No data</p>
              </div>
            )}
          </div>
          {leftStep && (
            <ActionBadge action={leftStep.action} description={leftStep.description} />
          )}
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-2">
            <select
              value={rightAlgo}
              onChange={(e) => handleRightChange(e.target.value)}
              className="h-8 px-3 text-sm font-mono rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] cursor-pointer focus:outline-none focus:border-[var(--color-accent)]"
            >
              {ALGO_NAMES.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <span className="text-xs font-mono text-[var(--color-text-muted)]">
              Step {right.currentStepIndex + 1} / {right.steps.length}
            </span>
          </div>
          <div
            className="flex-1 min-h-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden"
          >
            {rightStep ? (
              <BarChart state={rightStep.state as SortingBarState} instanceId="cmp-right" />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-[var(--color-text-muted)] font-mono text-sm">No data</p>
              </div>
            )}
          </div>
          {rightStep && (
            <ActionBadge action={rightStep.action} description={rightStep.description} />
          )}
        </div>
      </div>

      {/* Shared control bar */}
      <div className="flex items-center justify-center gap-4 py-2">
        <Button size="sm" variant="ghost" onClick={stepBackward}>
          ⏮
        </Button>
        <Button size="sm" onClick={togglePlay}>
          {isPlaying ? '⏸' : '▶'}
        </Button>
        <Button size="sm" variant="ghost" onClick={stepForward}>
          ⏭
        </Button>

        <div className="w-px h-5 bg-[var(--color-border)]" />

        <div className="flex items-center gap-1">
          {speedOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSpeed(opt.value)}
              className={`px-2 py-0.5 text-xs font-mono rounded cursor-pointer transition-colors ${
                speed === opt.value
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-[var(--color-border)]" />

        {/* Step count comparison */}
        <div className="text-xs font-mono text-[var(--color-text-muted)]">
          {left.meta?.name}: {left.steps.length} steps | {right.meta?.name}: {right.steps.length} steps
        </div>
      </div>
    </div>
  );
}
