import type { Algorithm, AlgorithmStep } from '../types';
import type { SortingBarState } from './types';
import { generateIds } from '../../lib/utils';

function partition(
  arr: number[],
  ids: string[],
  low: number,
  high: number,
  steps: AlgorithmStep<SortingBarState>[],
  sorted: number[],
): number {
  const pivotValue = arr[high];

  // Show pivot selection
  steps.push({
    state: {
      values: [...arr],
      ids: [...ids],
      comparing: null,
      swapping: null,
      sorted: [...sorted],
      activeIndex: null,
      activeRange: [low, high],
      pivot: high,
    },
    activeLines: [6, 7, 8],
    description: `Partitioning [${low}..${high}], pivot = ${pivotValue} (index ${high})`,
    action: 'partition',
  });

  let i = low - 1;

  for (let j = low; j < high; j++) {
    // Compare step
    steps.push({
      state: {
        values: [...arr],
        ids: [...ids],
        comparing: [j, high],
        swapping: null,
        sorted: [...sorted],
        activeIndex: j,
        activeRange: [low, high],
        pivot: high,
      },
      activeLines: [9, 10],
      description: `Comparing ${arr[j]} with pivot ${pivotValue}`,
      action: 'compare',
    });

    if (arr[j] <= pivotValue) {
      i++;

      if (i !== j) {
        // Swap arr[i] and arr[j] (and ids)
        [arr[i], arr[j]] = [arr[j], arr[i]];
        [ids[i], ids[j]] = [ids[j], ids[i]];

        steps.push({
          state: {
            values: [...arr],
            ids: [...ids],
            comparing: null,
            swapping: [i, j],
            sorted: [...sorted],
            activeIndex: j,
            activeRange: [low, high],
            pivot: high,
          },
          activeLines: [11, 12],
          description: `Swapped ${arr[i]} and ${arr[j]}`,
          action: 'swap',
        });
      }
    }
  }

  // Final swap: place pivot in correct position
  const pivotFinal = i + 1;
  if (pivotFinal !== high) {
    [arr[pivotFinal], arr[high]] = [arr[high], arr[pivotFinal]];
    [ids[pivotFinal], ids[high]] = [ids[high], ids[pivotFinal]];

    steps.push({
      state: {
        values: [...arr],
        ids: [...ids],
        comparing: null,
        swapping: [pivotFinal, high],
        sorted: [...sorted],
        activeIndex: null,
        activeRange: [low, high],
        pivot: pivotFinal,
      },
      activeLines: [13],
      description: `Placed pivot ${arr[pivotFinal]} at index ${pivotFinal}`,
      action: 'swap',
    });
  }

  // Mark pivot as sorted
  sorted.push(pivotFinal);

  steps.push({
    state: {
      values: [...arr],
      ids: [...ids],
      comparing: null,
      swapping: null,
      sorted: [...sorted],
      activeIndex: null,
      activeRange: [low, high],
      pivot: pivotFinal,
    },
    activeLines: [14],
    description: `Pivot ${arr[pivotFinal]} is in its final position (index ${pivotFinal})`,
    action: 'set',
  });

  return pivotFinal;
}

function quickSortHelper(
  arr: number[],
  ids: string[],
  low: number,
  high: number,
  steps: AlgorithmStep<SortingBarState>[],
  sorted: number[],
): void {
  if (low >= high) {
    // Single element or empty range — mark as sorted
    if (low === high && !sorted.includes(low)) {
      sorted.push(low);

      steps.push({
        state: {
          values: [...arr],
          ids: [...ids],
          comparing: null,
          swapping: null,
          sorted: [...sorted],
          activeIndex: low,
          activeRange: null,
          pivot: null,
        },
        activeLines: [0, 1],
        description: `Element ${arr[low]} (index ${low}) is in its final position`,
        action: 'set',
      });
    }
    return;
  }

  // Partition
  const pivotIdx = partition(arr, ids, low, high, steps, sorted);

  // Recurse left
  quickSortHelper(arr, ids, low, pivotIdx - 1, steps, sorted);

  // Recurse right
  quickSortHelper(arr, ids, pivotIdx + 1, high, steps, sorted);
}

export const quickSort: Algorithm<SortingBarState> = {
  meta: {
    name: 'Quick Sort',
    slug: 'quick-sort',
    category: 'sorting',
    complexity: {
      time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
      space: 'O(log n)',
    },
    stable: false,
    pseudocode: [
      'procedure quickSort(A, low, high)',
      '  if low >= high then return',
      '  pivotIdx ← partition(A, low, high)',
      '  quickSort(A, low, pivotIdx - 1)',
      '  quickSort(A, pivotIdx + 1, high)',
      '',
      'procedure partition(A, low, high)',
      '  pivot ← A[high]',
      '  i ← low - 1',
      '  for j ← low to high - 1 do',
      '    if A[j] ≤ pivot then',
      '      i ← i + 1',
      '      swap(A[i], A[j])',
      '  swap(A[i + 1], A[high])',
      '  return i + 1',
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
        activeRange: null,
        pivot: null,
      },
      activeLines: [0],
      description: `Starting with array [${arr.join(', ')}]`,
      action: 'init',
    });

    quickSortHelper(arr, ids, 0, arr.length - 1, steps, sorted);

    // Final sorted state
    steps.push({
      state: {
        values: [...arr],
        ids: [...ids],
        comparing: null,
        swapping: null,
        sorted: Array.from({ length: arr.length }, (_, k) => k),
        activeIndex: null,
        activeRange: null,
        pivot: null,
      },
      activeLines: [0],
      description: 'Array is sorted!',
      action: 'done',
    });

    return steps;
  },
};
