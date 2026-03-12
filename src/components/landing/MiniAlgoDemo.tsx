import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MiniStep {
  bars: number[];
  active: number[];
  sorted: number[];
  annotation: string;
}

interface MiniAlgoDemoProps {
  steps: MiniStep[];
  speed?: number;
  label: string;
}

/** Reusable mini bar animation with step annotations */
function MiniBarView({ step }: { step: MiniStep }) {
  const maxVal = Math.max(...step.bars);
  return (
    <div className="flex items-end gap-[2px] h-full w-full">
      {step.bars.map((value, i) => {
        const height = (value / maxVal) * 100;
        const isActive = step.active.includes(i);
        const isSorted = step.sorted.includes(i);
        return (
          <motion.div
            key={i}
            className="flex-1 rounded-t"
            animate={{
              height: `${height}%`,
              backgroundColor: isSorted
                ? 'var(--color-success)'
                : isActive
                ? 'var(--color-accent)'
                : 'var(--color-text-muted)',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{ opacity: isActive || isSorted ? 1 : 0.4 }}
          />
        );
      })}
    </div>
  );
}

export function MiniAlgoDemo({ steps, speed = 600, label }: MiniAlgoDemoProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runningRef = useRef(true);

  useEffect(() => {
    runningRef.current = true;

    function tick() {
      if (!runningRef.current) return;
      setStepIdx((prev) => {
        const next = (prev + 1) % steps.length;
        return next;
      });
      timeoutRef.current = setTimeout(tick, speed);
    }

    timeoutRef.current = setTimeout(tick, speed * 2);

    return () => {
      runningRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [steps, speed]);

  const currentStep = steps[stepIdx];

  return (
    <div className="w-full">
      <div className="aspect-[3/2] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt,rgba(0,0,0,0.1))] p-3 flex flex-col gap-2">
        <div className="flex-1 min-h-0">
          <MiniBarView step={currentStep} />
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={currentStep.annotation}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="text-[10px] font-mono text-[var(--color-accent)] leading-tight min-h-[2em]"
          >
            {currentStep.annotation}
          </motion.p>
        </AnimatePresence>
      </div>
      <p className="text-center text-[10px] text-[var(--color-text-muted)] mt-1.5 font-mono">
        {label}
      </p>
    </div>
  );
}

/* ============================================================
 * Pre-built step sequences for each algorithm
 * ============================================================ */

function swap<T>(arr: T[], i: number, j: number): T[] {
  const a = [...arr];
  [a[i], a[j]] = [a[j], a[i]];
  return a;
}

// ---------- Bubble Sort ----------
export function bubbleSortSteps(): MiniStep[] {
  const steps: MiniStep[] = [];
  let arr = [65, 35, 85, 20, 50];
  const n = arr.length;
  steps.push({ bars: [...arr], active: [], sorted: [], annotation: 'Start: compare adjacent pairs' });

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({ bars: [...arr], active: [j, j + 1], sorted: Array.from({ length: i }, (_, k) => n - 1 - k), annotation: `Compare [${j}] and [${j + 1}]` });
      if (arr[j] > arr[j + 1]) {
        arr = swap(arr, j, j + 1);
        steps.push({ bars: [...arr], active: [j, j + 1], sorted: Array.from({ length: i }, (_, k) => n - 1 - k), annotation: `Swap! ${arr[j + 1]} > ${arr[j]}` });
      }
    }
    steps.push({ bars: [...arr], active: [], sorted: Array.from({ length: i + 1 }, (_, k) => n - 1 - k), annotation: `Pass ${i + 1} done — largest bubbles to end` });
  }
  steps.push({ bars: [...arr], active: [], sorted: arr.map((_, i) => i), annotation: 'Sorted!' });
  return steps;
}

// ---------- Insertion Sort ----------
export function insertionSortSteps(): MiniStep[] {
  const steps: MiniStep[] = [];
  let arr = [50, 20, 80, 35, 65];
  steps.push({ bars: [...arr], active: [], sorted: [0], annotation: 'First element is trivially sorted' });

  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    steps.push({ bars: [...arr], active: [i], sorted: Array.from({ length: i }, (_, k) => k), annotation: `Pick key = ${key} at [${i}]` });
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      steps.push({ bars: [...arr], active: [j, j + 1], sorted: Array.from({ length: i }, (_, k) => k), annotation: `Shift ${arr[j]} right` });
      j--;
    }
    arr[j + 1] = key;
    steps.push({ bars: [...arr], active: [j + 1], sorted: Array.from({ length: i + 1 }, (_, k) => k), annotation: `Insert ${key} at [${j + 1}]` });
  }
  steps.push({ bars: [...arr], active: [], sorted: arr.map((_, i) => i), annotation: 'Sorted!' });
  return steps;
}

// ---------- Selection Sort ----------
export function selectionSortSteps(): MiniStep[] {
  const steps: MiniStep[] = [];
  let arr = [60, 25, 75, 15, 45];
  steps.push({ bars: [...arr], active: [], sorted: [], annotation: 'Find minimum, swap to front' });

  for (let i = 0; i < arr.length - 1; i++) {
    let minIdx = i;
    steps.push({ bars: [...arr], active: [i], sorted: Array.from({ length: i }, (_, k) => k), annotation: `Scanning for min from [${i}]...` });
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    steps.push({ bars: [...arr], active: [i, minIdx], sorted: Array.from({ length: i }, (_, k) => k), annotation: `Min = ${arr[minIdx]} at [${minIdx}]` });
    if (minIdx !== i) {
      arr = swap(arr, i, minIdx);
      steps.push({ bars: [...arr], active: [i], sorted: Array.from({ length: i + 1 }, (_, k) => k), annotation: `Swap to position [${i}]` });
    }
  }
  steps.push({ bars: [...arr], active: [], sorted: arr.map((_, i) => i), annotation: 'Sorted!' });
  return steps;
}

// ---------- Merge Sort ----------
export function mergeSortSteps(): MiniStep[] {
  const steps: MiniStep[] = [];
  const arr = [70, 30, 90, 10, 50];
  const sorted: number[] = [];
  steps.push({ bars: [...arr], active: [], sorted: [], annotation: 'Divide array in half recursively' });
  steps.push({ bars: [...arr], active: [0, 1], sorted: [], annotation: 'Split: [70,30] | [90,10,50]' });
  steps.push({ bars: [30, 70, 90, 10, 50], active: [0, 1], sorted: [], annotation: 'Merge [30,70] — sorted pair' });
  steps.push({ bars: [30, 70, 90, 10, 50], active: [2, 3, 4], sorted: [], annotation: 'Split: [90] | [10,50]' });
  steps.push({ bars: [30, 70, 10, 50, 90], active: [2, 3, 4], sorted: [], annotation: 'Merge [10,50,90] — sorted triple' });
  steps.push({ bars: [10, 30, 50, 70, 90], active: [0, 1, 2, 3, 4], sorted: [], annotation: 'Merge both halves together' });
  steps.push({ bars: [10, 30, 50, 70, 90], active: [], sorted: [0, 1, 2, 3, 4], annotation: 'Sorted!' });
  return steps;
}

// ---------- Quick Sort ----------
export function quickSortSteps(): MiniStep[] {
  const steps: MiniStep[] = [];
  steps.push({ bars: [50, 20, 80, 35, 65], active: [], sorted: [], annotation: 'Choose pivot (last element)' });
  steps.push({ bars: [50, 20, 80, 35, 65], active: [4], sorted: [], annotation: 'Pivot = 65' });
  steps.push({ bars: [50, 20, 35, 80, 65], active: [2, 3], sorted: [], annotation: 'Partition: 35 < 65, swap' });
  steps.push({ bars: [50, 20, 35, 65, 80], active: [3], sorted: [3], annotation: 'Pivot 65 in correct position' });
  steps.push({ bars: [20, 35, 50, 65, 80], active: [0, 1, 2], sorted: [3], annotation: 'Recurse left: sort [50,20,35]' });
  steps.push({ bars: [20, 35, 50, 65, 80], active: [], sorted: [0, 1, 2, 3, 4], annotation: 'Sorted!' });
  return steps;
}

// ---------- Heap Sort ----------
export function heapSortSteps(): MiniStep[] {
  const steps: MiniStep[] = [];
  steps.push({ bars: [40, 70, 20, 60, 30], active: [], sorted: [], annotation: 'Build max-heap from array' });
  steps.push({ bars: [70, 60, 20, 40, 30], active: [0, 1, 3], sorted: [], annotation: 'Heapify: 70 is root (max)' });
  steps.push({ bars: [30, 60, 20, 40, 70], active: [0, 4], sorted: [4], annotation: 'Swap root 70 to end' });
  steps.push({ bars: [60, 40, 20, 30, 70], active: [0], sorted: [4], annotation: 'Re-heapify: 60 is new root' });
  steps.push({ bars: [30, 40, 20, 60, 70], active: [0, 3], sorted: [3, 4], annotation: 'Swap root 60 to position' });
  steps.push({ bars: [20, 30, 40, 60, 70], active: [], sorted: [0, 1, 2, 3, 4], annotation: 'Sorted!' });
  return steps;
}

// ---------- Binary Search ----------
export function binarySearchSteps(): MiniStep[] {
  const steps: MiniStep[] = [];
  const arr = [10, 25, 35, 50, 65, 80, 95];
  steps.push({ bars: arr, active: [], sorted: [], annotation: 'Target = 35, search sorted array' });
  steps.push({ bars: arr, active: [3], sorted: [], annotation: 'Mid = 50 — too big, go left' });
  steps.push({ bars: arr, active: [1], sorted: [], annotation: 'Mid = 25 — too small, go right' });
  steps.push({ bars: arr, active: [2], sorted: [2], annotation: 'Mid = 35 — Found!' });
  return steps;
}

// ---------- BFS ----------
export function bfsSteps(): MiniStep[] {
  // Use bar heights to represent "visited order" in a graph-like way
  const steps: MiniStep[] = [];
  const nodes = [30, 50, 40, 60, 35, 45, 55];
  steps.push({ bars: nodes, active: [0], sorted: [], annotation: 'Start at node 0, enqueue it' });
  steps.push({ bars: nodes, active: [1, 2], sorted: [0], annotation: 'Visit neighbors of 0: enqueue 1, 2' });
  steps.push({ bars: nodes, active: [3, 4], sorted: [0, 1, 2], annotation: 'Dequeue 1 — visit neighbors 3, 4' });
  steps.push({ bars: nodes, active: [5, 6], sorted: [0, 1, 2, 3, 4], annotation: 'Dequeue 2 — visit neighbors 5, 6' });
  steps.push({ bars: nodes, active: [], sorted: [0, 1, 2, 3, 4, 5, 6], annotation: 'All nodes visited layer-by-layer' });
  return steps;
}

// ---------- DFS ----------
export function dfsSteps(): MiniStep[] {
  const nodes = [30, 50, 40, 60, 35, 45, 55];
  const steps: MiniStep[] = [];
  steps.push({ bars: nodes, active: [0], sorted: [], annotation: 'Start at node 0, push to stack' });
  steps.push({ bars: nodes, active: [1], sorted: [0], annotation: 'Go deep: visit 1' });
  steps.push({ bars: nodes, active: [3], sorted: [0, 1], annotation: 'Go deeper: visit 3' });
  steps.push({ bars: nodes, active: [4], sorted: [0, 1, 3], annotation: 'Backtrack to 1, visit 4' });
  steps.push({ bars: nodes, active: [2], sorted: [0, 1, 3, 4], annotation: 'Backtrack to 0, visit 2' });
  steps.push({ bars: nodes, active: [], sorted: [0, 1, 2, 3, 4, 5, 6], annotation: 'All nodes visited depth-first' });
  return steps;
}

// ---------- BST ----------
export function bstSteps(): MiniStep[] {
  const steps: MiniStep[] = [];
  steps.push({ bars: [50, 0, 0, 0, 0], active: [0], sorted: [], annotation: 'Insert 50 as root' });
  steps.push({ bars: [50, 30, 0, 0, 0], active: [1], sorted: [0], annotation: 'Insert 30: 30 < 50, go left' });
  steps.push({ bars: [50, 30, 70, 0, 0], active: [2], sorted: [0, 1], annotation: 'Insert 70: 70 > 50, go right' });
  steps.push({ bars: [50, 30, 70, 20, 0], active: [3], sorted: [0, 1, 2], annotation: 'Insert 20: left of 30' });
  steps.push({ bars: [50, 30, 70, 20, 40], active: [4], sorted: [0, 1, 2, 3], annotation: 'Insert 40: right of 30' });
  steps.push({ bars: [50, 30, 70, 20, 40], active: [], sorted: [0, 1, 2, 3, 4], annotation: 'BST property maintained!' });
  return steps;
}

// ---------- AVL Tree ----------
export function avlSteps(): MiniStep[] {
  const steps: MiniStep[] = [];
  steps.push({ bars: [30, 20, 10, 0, 0], active: [0, 1, 2], sorted: [], annotation: 'Insert 30, 20, 10 — left-heavy!' });
  steps.push({ bars: [30, 20, 10, 0, 0], active: [0], sorted: [], annotation: 'Node 30 balance = -2 — unbalanced' });
  steps.push({ bars: [20, 10, 30, 0, 0], active: [0, 1, 2], sorted: [], annotation: 'Right rotate! 20 becomes root' });
  steps.push({ bars: [20, 10, 30, 25, 0], active: [3], sorted: [0, 1, 2], annotation: 'Insert 25: right of 20, left of 30' });
  steps.push({ bars: [20, 10, 30, 25, 35], active: [4], sorted: [0, 1, 2, 3], annotation: 'Insert 35: balanced, no rotation' });
  steps.push({ bars: [20, 10, 30, 25, 35], active: [], sorted: [0, 1, 2, 3, 4], annotation: 'AVL balanced at all times!' });
  return steps;
}

// ---------- Hash Table ----------
export function hashTableSteps(): MiniStep[] {
  // Bars represent bucket occupancy (0 = empty, value = occupied)
  const steps: MiniStep[] = [];
  steps.push({ bars: [0, 0, 0, 0, 0, 0, 0], active: [], sorted: [], annotation: 'Empty table of size 7' });
  steps.push({ bars: [0, 22, 0, 0, 0, 0, 0], active: [1], sorted: [], annotation: 'h(22) = 22 mod 7 = 1 → insert' });
  steps.push({ bars: [0, 22, 0, 10, 0, 0, 0], active: [3], sorted: [1], annotation: 'h(10) = 10 mod 7 = 3 → insert' });
  steps.push({ bars: [0, 22, 15, 10, 0, 0, 0], active: [1, 2], sorted: [1, 3], annotation: 'h(15) = 1 → collision! Probe to 2' });
  steps.push({ bars: [0, 22, 15, 10, 0, 0, 31], active: [3, 6], sorted: [1, 2, 3], annotation: 'h(31) = 3 → collision! Probe to 6' });
  steps.push({ bars: [0, 22, 15, 10, 0, 0, 31], active: [], sorted: [1, 2, 3, 6], annotation: 'All keys inserted with 2 collisions' });
  return steps;
}

// ---------- Topological Sort ----------
export function topoSortSteps(): MiniStep[] {
  const steps: MiniStep[] = [];
  const nodes = [40, 50, 30, 60, 45, 35, 55];
  steps.push({ bars: nodes, active: [0, 1], sorted: [], annotation: 'Find nodes with in-degree 0: A, B' });
  steps.push({ bars: nodes, active: [0], sorted: [], annotation: 'Dequeue A, add to order' });
  steps.push({ bars: nodes, active: [2, 3], sorted: [0], annotation: 'Decrement in-degrees of C, D' });
  steps.push({ bars: nodes, active: [1], sorted: [0], annotation: 'Dequeue B, add to order' });
  steps.push({ bars: nodes, active: [3, 4], sorted: [0, 1], annotation: 'D and E in-degree \u2192 0, enqueue' });
  steps.push({ bars: nodes, active: [], sorted: [0, 1, 2, 3, 4, 5, 6], annotation: 'All nodes ordered!' });
  return steps;
}

// ---------- Dijkstra ----------
export function dijkstraSteps(): MiniStep[] {
  const steps: MiniStep[] = [];
  const nodes = [0, 50, 30, 80, 60, 45]; // distances visualized as bar heights
  steps.push({ bars: [10, 50, 30, 80, 60, 45], active: [0], sorted: [], annotation: 'Source A: dist=0, all others=\u221E' });
  steps.push({ bars: [10, 50, 30, 80, 60, 45], active: [1, 2], sorted: [0], annotation: 'Relax neighbors of A: B=5, C=3' });
  steps.push({ bars: [10, 50, 30, 80, 60, 45], active: [2], sorted: [0], annotation: 'Pick closest unvisited: C (dist=3)' });
  steps.push({ bars: [10, 50, 30, 80, 90, 45], active: [4], sorted: [0, 2], annotation: 'Relax C\u2192E: dist[E] = 3+6 = 9' });
  steps.push({ bars: [10, 50, 30, 70, 90, 45], active: [1, 3], sorted: [0, 2], annotation: 'Pick B (dist=5), relax B\u2192D: 5+2=7' });
  steps.push({ bars: [10, 50, 30, 70, 90, 45], active: [], sorted: [0, 1, 2, 3, 4, 5], annotation: 'All shortest paths found!' });
  return steps;
}

// ---------- Union-Find ----------
export function unionFindSteps(): MiniStep[] {
  // Bars represent elements; active = being operated on; sorted = same set
  const steps: MiniStep[] = [];
  const n = [20, 30, 40, 50, 60];
  steps.push({ bars: n, active: [], sorted: [], annotation: 'Each element in its own set' });
  steps.push({ bars: n, active: [0, 1], sorted: [], annotation: 'Union(0, 1) — merge sets' });
  steps.push({ bars: n, active: [2, 3], sorted: [0, 1], annotation: 'Union(2, 3) — merge sets' });
  steps.push({ bars: n, active: [0, 2], sorted: [0, 1, 2, 3], annotation: 'Union(0, 2) — merge two groups' });
  steps.push({ bars: n, active: [4], sorted: [0, 1, 2, 3], annotation: 'Find(4) — 4 is its own root' });
  steps.push({ bars: n, active: [], sorted: [0, 1, 2, 3, 4], annotation: 'Path compressed, sets tracked!' });
  return steps;
}

// ---------- KMP String Search ----------
export function kmpSteps(): MiniStep[] {
  const steps: MiniStep[] = [];
  const bars = [40, 50, 40, 50, 60, 40, 50, 40, 50, 55];
  steps.push({ bars, active: [], sorted: [], annotation: 'Text: A B A B C A B A B C' });
  steps.push({ bars, active: [0, 1, 2, 3], sorted: [], annotation: 'Match: A B A B (pattern chars 0-3)' });
  steps.push({ bars, active: [4], sorted: [], annotation: 'Mismatch! text[4]=C vs pattern[4]' });
  steps.push({ bars, active: [2, 3], sorted: [], annotation: 'LPS shift: skip 2 matched chars' });
  steps.push({ bars, active: [2, 3, 4, 5, 6], sorted: [], annotation: 'Resume matching from i=2' });
  steps.push({ bars, active: [5, 6, 7, 8, 9], sorted: [5, 6, 7, 8, 9], annotation: 'Pattern found at index 5!' });
  steps.push({ bars, active: [], sorted: [5, 6, 7, 8, 9], annotation: 'KMP: O(n+m), no backtracking!' });
  return steps;
}

// ---------- Segment Tree ----------
export function segTreeSteps(): MiniStep[] {
  const steps: MiniStep[] = [];
  const bars = [10, 30, 50, 70, 90, 60];
  steps.push({ bars, active: [], sorted: [], annotation: 'Array: [1, 3, 5, 7, 9, 11]' });
  steps.push({ bars, active: [0, 1], sorted: [], annotation: 'Build leaves, sum pairs bottom-up' });
  steps.push({ bars, active: [0, 1, 2, 3, 4, 5], sorted: [], annotation: 'Tree built! Root = 36 (total sum)' });
  steps.push({ bars, active: [1, 2, 3], sorted: [], annotation: 'Query [1,3]: traverse overlapping nodes' });
  steps.push({ bars, active: [1, 2, 3], sorted: [1, 2, 3], annotation: 'Result: 3 + 5 + 7 = 15' });
  steps.push({ bars: [10, 30, 80, 70, 90, 60], active: [2], sorted: [], annotation: 'Update arr[2] = 10: propagate up' });
  steps.push({ bars: [10, 30, 80, 70, 90, 60], active: [], sorted: [0, 1, 2, 3, 4, 5], annotation: 'O(log n) query and update!' });
  return steps;
}

// ---------- Red-Black Tree ----------
export function rbTreeSteps(): MiniStep[] {
  const steps: MiniStep[] = [];
  steps.push({ bars: [50, 0, 0, 0, 0], active: [0], sorted: [], annotation: 'Insert 20 as BLACK root' });
  steps.push({ bars: [50, 30, 0, 0, 0], active: [1], sorted: [0], annotation: 'Insert 10: RED child of 20' });
  steps.push({ bars: [50, 30, 70, 0, 0], active: [2], sorted: [0, 1], annotation: 'Insert 30: RED child of 20' });
  steps.push({ bars: [50, 30, 70, 20, 0], active: [0, 1, 2], sorted: [], annotation: 'Insert 15: uncle RED \u2192 recolor!' });
  steps.push({ bars: [30, 20, 50, 70, 25], active: [1], sorted: [0, 2, 3], annotation: 'Case 3: rotate + recolor' });
  steps.push({ bars: [30, 20, 50, 70, 25], active: [], sorted: [0, 1, 2, 3, 4], annotation: 'RB balanced! O(log n) always' });
  return steps;
}
