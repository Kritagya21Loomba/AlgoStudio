import type { Algorithm, AlgorithmStep } from '../types';
import type { SortingBarState } from './types';
import { generateIds } from '../../lib/utils';

function heapify(
  arr: number[],
  ids: string[],
  n: number,
  i: number,
  steps: AlgorithmStep<SortingBarState>[],
  sorted: number[],
): void {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  // Compare parent with left child
  if (left < n) {
    steps.push({
      state: {
        values: [...arr],
        ids: [...ids],
        comparing: [i, left],
        swapping: null,
        sorted: [...sorted],
        activeIndex: i,
      },
      activeLines: [7, 8, 9],
      description: `Comparing parent ${arr[i]} (index ${i}) with left child ${arr[left]} (index ${left})`,
      action: 'compare',
    });

    if (arr[left] > arr[largest]) {
      largest = left;
    }
  }

  // Compare current largest with right child
  if (right < n) {
    steps.push({
      state: {
        values: [...arr],
        ids: [...ids],
        comparing: [largest, right],
        swapping: null,
        sorted: [...sorted],
        activeIndex: i,
      },
      activeLines: [10, 11],
      description: `Comparing ${arr[largest]} (index ${largest}) with right child ${arr[right]} (index ${right})`,
      action: 'compare',
    });

    if (arr[right] > arr[largest]) {
      largest = right;
    }
  }

  // If largest is not the parent, swap and recurse
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    [ids[i], ids[largest]] = [ids[largest], ids[i]];

    steps.push({
      state: {
        values: [...arr],
        ids: [...ids],
        comparing: null,
        swapping: [i, largest],
        sorted: [...sorted],
        activeIndex: i,
      },
      activeLines: [12, 13],
      description: `Swapped ${arr[i]} and ${arr[largest]} to maintain heap property`,
      action: 'swap',
    });

    heapify(arr, ids, n, largest, steps, sorted);
  }
}

export const heapSort: Algorithm<SortingBarState> = {
  meta: {
    name: 'Heap Sort',
    slug: 'heap-sort',
    category: 'sorting',
    complexity: {
      time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
      space: 'O(1)',
    },
    stable: false,
    pseudocode: [
      'procedure heapSort(A: list)',
      '  n ← length(A)',
      '  for i ← ⌊n/2⌋ - 1 down to 0 do',
      '    heapify(A, n, i)',
      '  for i ← n - 1 down to 1 do',
      '    swap(A[0], A[i])',
      '    heapify(A, i, 0)',
      'procedure heapify(A, n, i)',
      '  largest ← i',
      '  left ← 2*i + 1, right ← 2*i + 2',
      '  if left < n and A[left] > A[largest] then largest ← left',
      '  if right < n and A[right] > A[largest] then largest ← right',
      '  if largest ≠ i then',
      '    swap(A[i], A[largest])',
      '    heapify(A, n, largest)',
    ],
  },

  generateSteps(input: number[]): AlgorithmStep<SortingBarState>[] {
    const steps: AlgorithmStep<SortingBarState>[] = [];
    const arr = [...input];
    const ids = generateIds(arr.length);
    const sorted: number[] = [];
    const n = arr.length;

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

    // Phase 1: Build max-heap (heapify from n/2-1 down to 0)
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      steps.push({
        state: {
          values: [...arr],
          ids: [...ids],
          comparing: null,
          swapping: null,
          sorted: [...sorted],
          activeIndex: i,
        },
        activeLines: [2, 3],
        description: `Building max-heap: heapifying subtree rooted at index ${i}`,
        action: 'compare',
      });

      heapify(arr, ids, n, i, steps, sorted);
    }

    // Phase 2: Extract elements from heap one by one
    for (let i = n - 1; i > 0; i--) {
      // Swap root (max) with last unsorted element
      [arr[0], arr[i]] = [arr[i], arr[0]];
      [ids[0], ids[i]] = [ids[i], ids[0]];

      steps.push({
        state: {
          values: [...arr],
          ids: [...ids],
          comparing: null,
          swapping: [0, i],
          sorted: [...sorted],
          activeIndex: 0,
        },
        activeLines: [4, 5],
        description: `Swapped max ${arr[i]} to sorted position ${i}`,
        action: 'swap',
      });

      // Mark position i as sorted
      sorted.push(i);

      // Heapify the reduced heap
      steps.push({
        state: {
          values: [...arr],
          ids: [...ids],
          comparing: null,
          swapping: null,
          sorted: [...sorted],
          activeIndex: 0,
        },
        activeLines: [6],
        description: `Heapifying root with heap size ${i}`,
        action: 'compare',
      });

      heapify(arr, ids, i, 0, steps, sorted);
    }

    // Mark index 0 as sorted too
    sorted.push(0);

    // Final sorted state
    steps.push({
      state: {
        values: [...arr],
        ids: [...ids],
        comparing: null,
        swapping: null,
        sorted: Array.from({ length: n }, (_, k) => k),
        activeIndex: null,
      },
      activeLines: [0],
      description: 'Array is sorted!',
      action: 'done',
    });

    return steps;
  },
};
