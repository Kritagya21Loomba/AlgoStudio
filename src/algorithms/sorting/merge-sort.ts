import type { Algorithm, AlgorithmStep } from '../types';
import type { SortingBarState, SplitLevel } from './types';
import { generateIds } from '../../lib/utils';

/**
 * Build the full binary-split tree for merge sort visualization.
 * Each level shows the subarrays at that depth.
 */
function buildSplitTree(arr: number[]): SplitLevel[] {
  const levels: SplitLevel[] = [];
  // Level 0 = full array
  let current: { values: number[]; left: number; right: number }[] = [
    { values: [...arr], left: 0, right: arr.length - 1 },
  ];
  levels.push({ label: 'split', subarrays: current.map((s) => ({ ...s })) });

  // Keep splitting until every subarray has length 1
  while (current.some((s) => s.values.length > 1)) {
    const next: { values: number[]; left: number; right: number }[] = [];
    for (const sub of current) {
      if (sub.values.length <= 1) {
        next.push({ ...sub });
      } else {
        const mid = Math.floor(sub.values.length / 2);
        next.push({
          values: sub.values.slice(0, mid),
          left: sub.left,
          right: sub.left + mid - 1,
        });
        next.push({
          values: sub.values.slice(mid),
          left: sub.left + mid,
          right: sub.right,
        });
      }
    }
    current = next;
    levels.push({ label: 'split', subarrays: current.map((s) => ({ ...s })) });
  }

  return levels;
}

export const mergeSort: Algorithm<SortingBarState> = {
  meta: {
    name: 'Merge Sort',
    slug: 'merge-sort',
    category: 'sorting',
    complexity: {
      time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
      space: 'O(n)',
    },
    stable: true,
    pseudocode: [
      'procedure mergeSort(A, left, right)',
      '  if left >= right then return',
      '  mid \u2190 \u230a(left + right) / 2\u230b',
      '  mergeSort(A, left, mid)',
      '  mergeSort(A, mid + 1, right)',
      '  merge(A, left, mid, right)',
      '',
      'procedure merge(A, left, mid, right)',
      '  L \u2190 A[left..mid], R \u2190 A[mid+1..right]',
      '  i \u2190 0, j \u2190 0, k \u2190 left',
      '  while i < |L| and j < |R| do',
      '    if L[i] \u2264 R[j] then',
      '      A[k] \u2190 L[i]; i++',
      '    else',
      '      A[k] \u2190 R[j]; j++',
      '    k++',
      '  copy remaining from L and R',
    ],
  },

  generateSteps(input: number[]): AlgorithmStep<SortingBarState>[] {
    const steps: AlgorithmStep<SortingBarState>[] = [];
    const arr = [...input];
    const ids = generateIds(arr.length);
    const sorted: number[] = [];

    // Precompute the full split tree from the ORIGINAL input
    const splitTreeDown = buildSplitTree(input);
    // We'll track merge levels going back up
    const mergeLevels: SplitLevel[] = [];

    function makeState(overrides: Partial<SortingBarState>): SortingBarState {
      return {
        values: [...arr],
        ids: [...ids],
        comparing: null,
        swapping: null,
        sorted: [...sorted],
        activeIndex: null,
        activeRange: null,
        splitLevels: [...splitTreeDown, ...mergeLevels],
        ...overrides,
      };
    }

    // Initial state — show full array
    steps.push({
      state: makeState({ splitLevels: [splitTreeDown[0]] }),
      activeLines: [0],
      description: `Starting Merge Sort on [${arr.join(', ')}]. We'll split, then merge back.`,
      action: 'init',
    });

    // Show the split phase: reveal each level
    for (let lvl = 1; lvl < splitTreeDown.length; lvl++) {
      const shown = splitTreeDown.slice(0, lvl + 1);
      // Mark the new level subarrays as active
      const activeShown = shown.map((level, li) => {
        if (li === lvl) {
          return {
            ...level,
            subarrays: level.subarrays.map((s) => ({ ...s, active: true })),
          };
        }
        return level;
      });

      steps.push({
        state: makeState({ splitLevels: activeShown }),
        activeLines: [0, 1, 2],
        description: lvl === splitTreeDown.length - 1
          ? `Split complete! Each subarray has 1 element. Now merge back up.`
          : `Split into ${shown[lvl].subarrays.length} subarrays at depth ${lvl}.`,
        action: 'init',
      });
    }

    // Now do the actual merge sort and track merge levels
    function mergeSortHelper(left: number, right: number) {
      if (left >= right) return;

      const mid = Math.floor((left + right) / 2);
      mergeSortHelper(left, mid);
      mergeSortHelper(mid + 1, right);
      merge(left, mid, right);
    }

    function merge(left: number, mid: number, right: number) {
      // Show merge start
      steps.push({
        state: makeState({
          activeRange: [left, right],
        }),
        activeLines: [7, 8, 9],
        description: `Merging [${left}..${mid}] and [${mid + 1}..${right}]`,
        action: 'init',
      });

      const leftValues = arr.slice(left, mid + 1);
      const leftIds = ids.slice(left, mid + 1);
      const rightValues = arr.slice(mid + 1, right + 1);
      const rightIds = ids.slice(mid + 1, right + 1);

      let i = 0;
      let j = 0;
      let k = left;

      while (i < leftValues.length && j < rightValues.length) {
        steps.push({
          state: makeState({
            activeIndex: k,
            activeRange: [left, right],
          }),
          activeLines: [10, 11],
          description: `Compare ${leftValues[i]} (left) vs ${rightValues[j]} (right)`,
          action: 'compare',
        });

        if (leftValues[i] <= rightValues[j]) {
          arr[k] = leftValues[i];
          ids[k] = leftIds[i];
          i++;
        } else {
          arr[k] = rightValues[j];
          ids[k] = rightIds[j];
          j++;
        }

        steps.push({
          state: makeState({
            activeIndex: k,
            activeRange: [left, right],
          }),
          activeLines: [12],
          description: `Place ${arr[k]} at position ${k}`,
          action: 'merge',
        });

        k++;
      }

      while (i < leftValues.length) {
        arr[k] = leftValues[i];
        ids[k] = leftIds[i];
        steps.push({
          state: makeState({
            activeIndex: k,
            activeRange: [left, right],
          }),
          activeLines: [16],
          description: `Place remaining ${arr[k]} at position ${k}`,
          action: 'merge',
        });
        i++;
        k++;
      }

      while (j < rightValues.length) {
        arr[k] = rightValues[j];
        ids[k] = rightIds[j];
        steps.push({
          state: makeState({
            activeIndex: k,
            activeRange: [left, right],
          }),
          activeLines: [16],
          description: `Place remaining ${arr[k]} at position ${k}`,
          action: 'merge',
        });
        j++;
        k++;
      }

      // Add the merged subarray to merge levels
      const mergedSub = {
        values: arr.slice(left, right + 1),
        left,
        right,
        merging: true,
      };

      // Find or create the correct merge level
      // Merge level depth = how many subarrays of this size exist
      const size = right - left + 1;
      let targetLevel = mergeLevels.find((l) =>
        l.subarrays.length === 0 || l.subarrays[0].values.length === size,
      );
      if (!targetLevel) {
        targetLevel = { label: 'merge', subarrays: [] };
        mergeLevels.push(targetLevel);
      }
      targetLevel.subarrays.push(mergedSub);

      // Show the merged result
      steps.push({
        state: makeState({
          activeRange: [left, right],
        }),
        activeLines: [5],
        description: `Merged [${left}..${right}] \u2192 [${arr.slice(left, right + 1).join(', ')}]`,
        action: 'set',
      });

      if (left === 0 && right === arr.length - 1) {
        for (let idx = left; idx <= right; idx++) {
          if (!sorted.includes(idx)) sorted.push(idx);
        }
      }
    }

    mergeSortHelper(0, arr.length - 1);

    // Final done step
    steps.push({
      state: makeState({
        sorted: Array.from({ length: arr.length }, (_, i) => i),
        activeRange: null,
      }),
      activeLines: [0],
      description: 'Array is fully sorted!',
      action: 'done',
    });

    return steps;
  },
};
