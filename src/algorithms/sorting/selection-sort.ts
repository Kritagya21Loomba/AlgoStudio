import type { Algorithm, AlgorithmStep } from '../types';
import type { SortingBarState } from './types';
import { generateIds } from '../../lib/utils';

export const selectionSort: Algorithm<SortingBarState> = {
  meta: {
    name: 'Selection Sort',
    slug: 'selection-sort',
    category: 'sorting',
    complexity: {
      time: { best: 'O(n\u00B2)', average: 'O(n\u00B2)', worst: 'O(n\u00B2)' },
      space: 'O(1)',
    },
    stable: false,
    pseudocode: [
      'procedure selectionSort(A: list)',
      '  n \u2190 length(A)',
      '  for i \u2190 0 to n - 2 do',
      '    minIdx \u2190 i',
      '    for j \u2190 i + 1 to n - 1 do',
      '      if A[j] < A[minIdx] then',
      '        minIdx \u2190 j',
      '    swap(A[i], A[minIdx])',
      '  return A',
    ],
  },

  generateSteps(input: number[]): AlgorithmStep<SortingBarState>[] {
    const steps: AlgorithmStep<SortingBarState>[] = [];
    const arr = [...input];
    const ids = generateIds(arr.length);
    const sorted: number[] = [];

    function makeState(overrides: Partial<SortingBarState>): SortingBarState {
      return {
        values: [...arr],
        ids: [...ids],
        comparing: null,
        swapping: null,
        sorted: [...sorted],
        activeIndex: null,
        minIndex: null,
        ...overrides,
      };
    }

    // Initial state
    steps.push({
      state: makeState({}),
      activeLines: [0, 1],
      description: `Starting Selection Sort. Each pass finds the minimum and places it at the front.`,
      action: 'init',
    });

    for (let i = 0; i < arr.length - 1; i++) {
      let minIdx = i;

      // Start of pass: assume minimum is at position i
      steps.push({
        state: makeState({
          activeIndex: i,
          minIndex: i,
          activeRange: [i, arr.length - 1],
        }),
        activeLines: [2, 3],
        description: `Pass ${i + 1}: Find minimum in unsorted portion [${i}..${arr.length - 1}]. Assume min = ${arr[i]} at index ${i}.`,
        action: 'compare',
      });

      for (let j = i + 1; j < arr.length; j++) {
        // Compare current element with current minimum
        steps.push({
          state: makeState({
            comparing: [j, minIdx],
            activeIndex: j,
            minIndex: minIdx,
            activeRange: [i, arr.length - 1],
          }),
          activeLines: [4, 5],
          description: `Compare A[${j}] = ${arr[j]} with current min A[${minIdx}] = ${arr[minIdx]}. ${arr[j] < arr[minIdx] ? arr[j] + ' < ' + arr[minIdx] + ' \u2014 new minimum!' : arr[j] + ' \u2265 ' + arr[minIdx] + ' \u2014 keep current min.'}`,
          action: 'compare',
        });

        if (arr[j] < arr[minIdx]) {
          const prevMin = minIdx;
          minIdx = j;

          // New minimum found
          steps.push({
            state: makeState({
              activeIndex: j,
              minIndex: minIdx,
              activeRange: [i, arr.length - 1],
            }),
            activeLines: [6],
            description: `New minimum! ${arr[minIdx]} at index ${minIdx} (was ${arr[prevMin]} at index ${prevMin}).`,
            action: 'highlight',
          });
        }
      }

      // Swap the minimum into position i
      if (minIdx !== i) {
        steps.push({
          state: makeState({
            minIndex: minIdx,
            activeRange: [i, arr.length - 1],
          }),
          activeLines: [7],
          description: `Minimum is ${arr[minIdx]} at index ${minIdx}. Swap it with A[${i}] = ${arr[i]} to place it in position.`,
          action: 'compare',
        });

        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        [ids[i], ids[minIdx]] = [ids[minIdx], ids[i]];

        steps.push({
          state: makeState({
            swapping: [i, minIdx],
          }),
          activeLines: [7],
          description: `Swapped! ${arr[i]} is now in its final position at index ${i}.`,
          action: 'swap',
        });
      } else {
        steps.push({
          state: makeState({
            minIndex: minIdx,
          }),
          activeLines: [7],
          description: `Minimum ${arr[i]} is already at index ${i}. No swap needed!`,
          action: 'set',
        });
      }

      sorted.push(i);
    }

    // Final sorted state
    sorted.push(arr.length - 1);
    steps.push({
      state: makeState({
        sorted: Array.from({ length: arr.length }, (_, k) => k),
      }),
      activeLines: [8],
      description: 'Array is fully sorted!',
      action: 'done',
    });

    return steps;
  },
};
