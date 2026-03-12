import type { Algorithm, AlgorithmStep } from '../types';
import type { SearchBarState, SearchInput } from './types';
import { generateIds } from '../../lib/utils';

export const binarySearch: Algorithm<SearchBarState, SearchInput> = {
  meta: {
    name: 'Binary Search',
    slug: 'binary-search',
    category: 'searching',
    complexity: {
      time: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
      space: 'O(1)',
    },
    pseudocode: [
      'procedure binarySearch(A, target)',
      '  left \u2190 0',
      '  right \u2190 length(A) - 1',
      '  while left \u2264 right do',
      '    mid \u2190 \u230a(left + right) / 2\u230b',
      '    if A[mid] = target then',
      '      return mid',
      '    else if A[mid] < target then',
      '      left \u2190 mid + 1',
      '    else',
      '      right \u2190 mid - 1',
      '  return -1 (not found)',
    ],
  },

  generateSteps(input: SearchInput): AlgorithmStep<SearchBarState>[] {
    const steps: AlgorithmStep<SearchBarState>[] = [];
    const { values, target } = input;
    const ids = generateIds(values.length);
    const eliminated: number[] = [];

    let left = 0;
    let right = values.length - 1;

    // Initial state
    steps.push({
      state: {
        values: [...values],
        ids: [...ids],
        left,
        right,
        mid: null,
        target,
        found: false,
        eliminated: [],
      },
      activeLines: [0, 1, 2],
      description: `Searching for ${target} in sorted array [${values.join(', ')}]`,
      action: 'init',
    });

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      // Compare step: show the mid element
      steps.push({
        state: {
          values: [...values],
          ids: [...ids],
          left,
          right,
          mid,
          target,
          found: false,
          eliminated: [...eliminated],
        },
        activeLines: [3, 4, 5],
        description: `mid = ${mid}, comparing A[${mid}] = ${values[mid]} with target ${target}`,
        action: 'compare',
      });

      if (values[mid] === target) {
        // Found the target
        steps.push({
          state: {
            values: [...values],
            ids: [...ids],
            left,
            right,
            mid,
            target,
            found: true,
            eliminated: [...eliminated],
          },
          activeLines: [5, 6],
          description: `Found ${target} at index ${mid}!`,
          action: 'found',
        });
        return steps;
      } else if (values[mid] < target) {
        // Target is in the right half — eliminate left portion
        for (let i = left; i <= mid; i++) {
          if (!eliminated.includes(i)) eliminated.push(i);
        }
        left = mid + 1;

        steps.push({
          state: {
            values: [...values],
            ids: [...ids],
            left,
            right,
            mid,
            target,
            found: false,
            eliminated: [...eliminated],
          },
          activeLines: [7, 8],
          description: `${values[mid]} < ${target} \u2014 eliminate left half, set left = ${left}`,
          action: 'eliminate',
        });
      } else {
        // Target is in the left half — eliminate right portion
        for (let i = mid; i <= right; i++) {
          if (!eliminated.includes(i)) eliminated.push(i);
        }
        right = mid - 1;

        steps.push({
          state: {
            values: [...values],
            ids: [...ids],
            left,
            right,
            mid,
            target,
            found: false,
            eliminated: [...eliminated],
          },
          activeLines: [9, 10],
          description: `${values[mid]} > ${target} \u2014 eliminate right half, set right = ${right}`,
          action: 'eliminate',
        });
      }
    }

    // Target not found
    steps.push({
      state: {
        values: [...values],
        ids: [...ids],
        left,
        right,
        mid: null,
        target,
        found: false,
        eliminated: [...eliminated],
      },
      activeLines: [11],
      description: `Target ${target} not found in the array.`,
      action: 'done',
    });

    return steps;
  },
};
