import type { Algorithm, AlgorithmStep } from '../types';
import type { SortingBarState } from './types';
import { generateIds } from '../../lib/utils';

export const insertionSort: Algorithm<SortingBarState> = {
  meta: {
    name: 'Insertion Sort',
    slug: 'insertion-sort',
    category: 'sorting',
    complexity: {
      time: { best: 'O(n)', average: 'O(n\u00B2)', worst: 'O(n\u00B2)' },
      space: 'O(1)',
    },
    stable: true,
    pseudocode: [
      'procedure insertionSort(A: list)',
      '  for i \u2190 1 to length(A) - 1 do',
      '    key \u2190 A[i]',
      '    j \u2190 i - 1',
      '    while j >= 0 and A[j] > key do',
      '      A[j + 1] \u2190 A[j]',
      '      j \u2190 j - 1',
      '    A[j + 1] \u2190 key',
      '  return A',
    ],
  },

  generateSteps(input: number[]): AlgorithmStep<SortingBarState>[] {
    const steps: AlgorithmStep<SortingBarState>[] = [];
    const arr = [...input];
    const ids = generateIds(arr.length);
    const sorted: number[] = [0]; // index 0 is trivially sorted

    function makeState(overrides: Partial<SortingBarState>): SortingBarState {
      return {
        values: [...arr],
        ids: [...ids],
        comparing: null,
        swapping: null,
        sorted: [...sorted],
        activeIndex: null,
        shifting: null,
        keyValue: null,
        insertTarget: null,
        sortedRange: sorted.length > 0 ? [0, Math.max(...sorted)] : null,
        minIndex: null,
        ...overrides,
      };
    }

    // Initial state
    steps.push({
      state: makeState({ sorted: [], sortedRange: null }),
      activeLines: [0],
      description: `Starting Insertion Sort. We'll build a sorted portion from left to right.`,
      action: 'init',
    });

    // Show that index 0 is already "sorted" (single element)
    steps.push({
      state: makeState({ sortedRange: [0, 0] }),
      activeLines: [1],
      description: `Index 0 (value ${arr[0]}) is trivially sorted on its own.`,
      action: 'highlight',
    });

    for (let i = 1; i < arr.length; i++) {
      const key = arr[i];
      const keyId = ids[i];

      // Pick up the key
      steps.push({
        state: makeState({
          activeIndex: i,
          shifting: i,
          keyValue: key,
          sortedRange: [0, i - 1],
        }),
        activeLines: [1, 2, 3],
        description: `Pick up key = ${key} from index ${i}. Need to insert it into sorted portion [0..${i - 1}].`,
        action: 'highlight',
      });

      let j = i - 1;
      let moved = false;

      while (j >= 0) {
        // Compare key with element at j
        steps.push({
          state: makeState({
            comparing: [j, j + 1],
            activeIndex: i,
            shifting: j + 1,
            keyValue: key,
            sortedRange: [0, i - 1],
          }),
          activeLines: [4],
          description: `Is A[${j}] = ${arr[j]} > key ${key}? ${arr[j] > key ? 'YES \u2014 need to shift right' : 'NO \u2014 found insertion point'}`,
          action: 'compare',
        });

        if (arr[j] > key) {
          // Shift element right
          arr[j + 1] = arr[j];
          ids[j + 1] = ids[j];
          moved = true;

          steps.push({
            state: makeState({
              activeIndex: i,
              shifting: j,
              keyValue: key,
              insertTarget: j,
              sortedRange: [0, i - 1],
            }),
            activeLines: [5, 6],
            description: `Shift ${arr[j + 1]} right from index ${j} \u2192 ${j + 1}. Gap opens at index ${j}.`,
            action: 'shift',
          });

          j--;
        } else {
          break;
        }
      }

      // Place key at j + 1
      arr[j + 1] = key;
      ids[j + 1] = keyId;
      sorted.push(i);

      steps.push({
        state: makeState({
          insertTarget: j + 1,
          keyValue: key,
          sortedRange: [0, i],
        }),
        activeLines: [7],
        description: moved
          ? `Insert key ${key} into index ${j + 1}. Sorted portion is now [0..${i}].`
          : `Key ${key} is already in the right place at index ${i}. No shifts needed!`,
        action: 'set',
      });
    }

    // Final sorted state
    steps.push({
      state: makeState({
        sorted: Array.from({ length: arr.length }, (_, k) => k),
        sortedRange: [0, arr.length - 1],
      }),
      activeLines: [8],
      description: 'Array is fully sorted!',
      action: 'done',
    });

    return steps;
  },
};
