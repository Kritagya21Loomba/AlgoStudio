import { create } from 'zustand';
import type { AlgorithmStep, AlgorithmMeta } from '../algorithms/types';

interface VisualizerState {
  // Data
  steps: AlgorithmStep<unknown>[];
  meta: AlgorithmMeta | null;
  inputArray: number[];

  // Playback
  currentStepIndex: number;
  isPlaying: boolean;
  speed: number; // ms per step

  // Actions
  loadAlgorithm: (steps: AlgorithmStep<unknown>[], meta: AlgorithmMeta, input: number[]) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  goToStep: (index: number) => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  setInputArray: (arr: number[]) => void;
}

export const useVisualizerStore = create<VisualizerState>((set, get) => ({
  steps: [],
  meta: null,
  inputArray: [],
  currentStepIndex: 0,
  isPlaying: false,
  speed: 500,

  loadAlgorithm: (steps, meta, input) =>
    set({ steps, meta, inputArray: input, currentStepIndex: 0, isPlaying: false }),

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

  stepForward: () => {
    const { currentStepIndex, steps } = get();
    if (currentStepIndex < steps.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    } else {
      set({ isPlaying: false });
    }
  },

  stepBackward: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1 });
    }
  },

  goToStep: (index) => set({ currentStepIndex: Math.max(0, Math.min(index, get().steps.length - 1)) }),
  reset: () => set({ currentStepIndex: 0, isPlaying: false }),
  setSpeed: (speed) => set({ speed }),
  setInputArray: (arr) => set({ inputArray: arr }),
}));
