import type { Algorithm, AlgorithmStep } from '../types';
import type { SortingBarState } from './types';
import { generateIds } from '../../lib/utils';

export const bubbleSort: Algorithm<SortingBarState> = {
  meta: {
    name: 'Bubble Sort',
    slug: 'bubble-sort',
    category: 'sorting',
    complexity: {
      time: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
      space: 'O(1)',
    },
    stable: true,
    pseudocode: [
      'procedure bubbleSort(A: list)',
      '  n ← length(A)',
      '  for i ← 0 to n - 1 do',
      '    swapped ← false',
      '    for j ← 0 to n - i - 2 do',
      '      if A[j] > A[j + 1] then',
      '        swap(A[j], A[j + 1])',
      '        swapped ← true',
      '    if not swapped then break',
      '  return A',
    ],
  },

  generateSteps(input: number[]): AlgorithmStep<SortingBarState>[] {
    const steps: AlgorithmStep<SortingBarState>[] = [];
    const arr = [...input];
    const ids = generateIds(arr.length);
    const sorted: number[] = [];

    // Initial state
    steps.push({
      state: {
        values: [...arr],
        ids: [...ids],
        comparing: null,
        swapping: null,
        sorted: [],
        activeIndex: null,
      },
      activeLines: [0, 1],
      description: `Starting with array [${arr.join(', ')}]`,
      action: 'init',
    });

    for (let i = 0; i < arr.length - 1; i++) {
      let swapped = false;

      for (let j = 0; j < arr.length - i - 1; j++) {
        // Compare step
        steps.push({
          state: {
            values: [...arr],
            ids: [...ids],
            comparing: [j, j + 1],
            swapping: null,
            sorted: [...sorted],
            activeIndex: j,
          },
          activeLines: [4, 5],
          description: `Comparing ${arr[j]} and ${arr[j + 1]}`,
          action: 'compare',
        });

        if (arr[j] > arr[j + 1]) {
          // Swap values and IDs together
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          [ids[j], ids[j + 1]] = [ids[j + 1], ids[j]];
          swapped = true;

          steps.push({
            state: {
              values: [...arr],
              ids: [...ids],
              comparing: null,
              swapping: [j, j + 1],
              sorted: [...sorted],
              activeIndex: j,
            },
            activeLines: [6, 7],
            description: `Swapped ${arr[j]} and ${arr[j + 1]}`,
            action: 'swap',
          });
        }
      }

      sorted.push(arr.length - 1 - i);

      if (!swapped) {
        // Early exit — array is already sorted
        const allSorted = Array.from({ length: arr.length }, (_, k) => k);
        steps.push({
          state: {
            values: [...arr],
            ids: [...ids],
            comparing: null,
            swapping: null,
            sorted: allSorted,
            activeIndex: null,
          },
          activeLines: [8],
          description: 'No swaps needed — array is sorted!',
          action: 'done',
        });
        return steps;
      }
    }

    // Final sorted state
    sorted.push(0);
    steps.push({
      state: {
        values: [...arr],
        ids: [...ids],
        comparing: null,
        swapping: null,
        sorted: Array.from({ length: arr.length }, (_, k) => k),
        activeIndex: null,
      },
      activeLines: [9],
      description: 'Array is sorted!',
      action: 'done',
    });

    return steps;
  },
};
