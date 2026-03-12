import { create } from 'zustand';
import type { AlgorithmStep, AlgorithmMeta } from '../algorithms/types';
import type { SortingBarState } from '../algorithms/sorting/types';

interface ComparePanel {
  steps: AlgorithmStep<SortingBarState>[];
  meta: AlgorithmMeta | null;
  currentStepIndex: number;
}

interface CompareState {
  left: ComparePanel;
  right: ComparePanel;
  isPlaying: boolean;
  speed: number;
  inputArray: number[];

  loadLeft: (steps: AlgorithmStep<SortingBarState>[], meta: AlgorithmMeta) => void;
  loadRight: (steps: AlgorithmStep<SortingBarState>[], meta: AlgorithmMeta) => void;
  setInputArray: (arr: number[]) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  goToStep: (index: number) => void;
}

function emptyPanel(): ComparePanel {
  return { steps: [], meta: null, currentStepIndex: 0 };
}

export const useCompareStore = create<CompareState>((set, get) => ({
  left: emptyPanel(),
  right: emptyPanel(),
  isPlaying: false,
  speed: 500,
  inputArray: [],

  loadLeft: (steps, meta) =>
    set({ left: { steps, meta, currentStepIndex: 0 }, isPlaying: false }),

  loadRight: (steps, meta) =>
    set({ right: { steps, meta, currentStepIndex: 0 }, isPlaying: false }),

  setInputArray: (arr) => set({ inputArray: arr }),

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

  stepForward: () => {
    const { left, right } = get();
    const leftDone = left.currentStepIndex >= left.steps.length - 1;
    const rightDone = right.currentStepIndex >= right.steps.length - 1;

    if (leftDone && rightDone) {
      set({ isPlaying: false });
      return;
    }

    set({
      left: {
        ...left,
        currentStepIndex: leftDone ? left.currentStepIndex : left.currentStepIndex + 1,
      },
      right: {
        ...right,
        currentStepIndex: rightDone ? right.currentStepIndex : right.currentStepIndex + 1,
      },
    });
  },

  stepBackward: () => {
    const { left, right } = get();
    set({
      left: {
        ...left,
        currentStepIndex: Math.max(0, left.currentStepIndex - 1),
      },
      right: {
        ...right,
        currentStepIndex: Math.max(0, right.currentStepIndex - 1),
      },
    });
  },

  reset: () => {
    const { left, right } = get();
    set({
      left: { ...left, currentStepIndex: 0 },
      right: { ...right, currentStepIndex: 0 },
      isPlaying: false,
    });
  },

  setSpeed: (speed) => set({ speed }),

  goToStep: (index) => {
    const { left, right } = get();
    set({
      left: {
        ...left,
        currentStepIndex: Math.max(0, Math.min(index, left.steps.length - 1)),
      },
      right: {
        ...right,
        currentStepIndex: Math.max(0, Math.min(index, right.steps.length - 1)),
      },
    });
  },
}));
