export interface SortingBarState {
  /** The array of values */
  values: number[];
  /** Stable IDs for each element — travels with the value during swaps */
  ids: string[];
  /** Indices currently being compared */
  comparing: [number, number] | null;
  /** Indices that just swapped */
  swapping: [number, number] | null;
  /** Indices confirmed in final sorted position */
  sorted: number[];
  /** Currently active/scanning index */
  activeIndex: number | null;
  /** Merge sort: current subarray bounds [left, right] */
  activeRange?: [number, number] | null;
  /** Quick sort: pivot index */
  pivot?: number | null;
  /** Insertion sort: index of element being inserted/shifted */
  shifting?: number | null;
  /** Selection sort: current minimum index being tracked */
  minIndex?: number | null;
  /** Insertion sort: the key value being inserted (for floating label) */
  keyValue?: number | null;
  /** Insertion sort: target slot where key will be placed */
  insertTarget?: number | null;
  /** Sorted portion boundary [start, end] inclusive */
  sortedRange?: [number, number] | null;
  /** Merge sort: tree of subarrays showing split/merge progression */
  splitLevels?: SplitLevel[] | null;
}

/** A row of subarrays at a given depth level for merge sort visualization */
export interface SplitLevel {
  label: 'split' | 'merge';
  subarrays: { values: number[]; left: number; right: number; active?: boolean; merging?: boolean }[];
}
