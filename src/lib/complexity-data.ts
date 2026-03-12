export interface ComplexityClass {
  label: string;
  fn: (n: number) => number;
  color: string;
  examples: string[];
}

export const COMPLEXITY_CLASSES: ComplexityClass[] = [
  {
    label: 'O(1)',
    fn: () => 1,
    color: '#22c55e', // green
    examples: ['Array access', 'Hash table lookup (avg)'],
  },
  {
    label: 'O(log n)',
    fn: (n) => Math.log2(Math.max(1, n)),
    color: '#3b82f6', // blue
    examples: ['Binary Search', 'BST lookup (avg)', 'AVL operations'],
  },
  {
    label: 'O(n)',
    fn: (n) => n,
    color: '#a855f7', // purple
    examples: ['Linear Search', 'BFS', 'DFS'],
  },
  {
    label: 'O(n log n)',
    fn: (n) => n * Math.log2(Math.max(1, n)),
    color: '#f97316', // orange
    examples: ['Merge Sort', 'Quick Sort (avg)', 'Heap Sort'],
  },
  {
    label: 'O(n²)',
    fn: (n) => n * n,
    color: '#ef4444', // red
    examples: ['Bubble Sort', 'Insertion Sort (worst)', 'Selection Sort'],
  },
  {
    label: 'O(2ⁿ)',
    fn: (n) => Math.pow(2, n),
    color: '#dc2626', // dark red
    examples: ['Recursive Fibonacci', 'Power set'],
  },
];
