import {
  MiniAlgoDemo,
  bubbleSortSteps,
  insertionSortSteps,
  selectionSortSteps,
  mergeSortSteps,
  quickSortSteps,
  heapSortSteps,
  binarySearchSteps,
  bfsSteps,
  dfsSteps,
  dijkstraSteps,
  topoSortSteps,
  bstSteps,
  avlSteps,
  hashTableSteps,
  unionFindSteps,
  kmpSteps,
  segTreeSteps,
  rbTreeSteps,
} from './MiniAlgoDemo';
import { motion } from 'framer-motion';

interface AlgoCardProps {
  href: string;
  badge: string;
  title: string;
  desc: string;
  meta: string;
  demoSteps: ReturnType<typeof bubbleSortSteps>;
  demoLabel: string;
  index?: number;
}

function AlgoCard({ href, badge, title, desc, meta, demoSteps, demoLabel, index = 0 }: AlgoCardProps) {
  return (
    <motion.a
      href={href}
      className="block p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-300 hover:border-[var(--color-accent)] hover:shadow-lg group"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <MiniAlgoDemo steps={demoSteps} label={demoLabel} />
      <div className="mt-3">
        <span className="inline-block text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] mb-2">
          {badge}
        </span>
        <h4 className="font-display text-xl tracking-wide text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
          {title}
        </h4>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">{desc}</p>
        <p className="mt-2 text-xs font-mono text-[var(--color-text-muted)]">{meta}</p>
      </div>
    </motion.a>
  );
}

export function AlgoCardGrid() {
  return (
    <div className="space-y-12">
      {/* Sorting */}
      <div>
        <motion.h3
          className="font-display text-2xl tracking-wide mb-4 text-[var(--color-text-muted)]"
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >Sorting</motion.h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AlgoCard href="/sorting/bubble-sort" badge="Sorting" title="Bubble Sort"
            desc="Compare adjacent elements and swap. Watch values bubble up to their correct positions."
            meta="O(n²) · Stable" demoSteps={bubbleSortSteps()} demoLabel="Bubble Sort — live" />
          <AlgoCard href="/sorting/insertion-sort" badge="Sorting" title="Insertion Sort"
            desc="Build a sorted array one element at a time by inserting each into its correct position."
            meta="O(n²) · Stable" demoSteps={insertionSortSteps()} demoLabel="Insertion Sort — live" />
          <AlgoCard href="/sorting/selection-sort" badge="Sorting" title="Selection Sort"
            desc="Find the minimum element and swap it to the front. Repeat for the unsorted portion."
            meta="O(n²) · Unstable" demoSteps={selectionSortSteps()} demoLabel="Selection Sort — live" />
          <AlgoCard href="/sorting/merge-sort" badge="Sorting" title="Merge Sort"
            desc="Divide the array in half, sort each half, then merge them back together."
            meta="O(n log n) · Stable" demoSteps={mergeSortSteps()} demoLabel="Merge Sort — live" />
          <AlgoCard href="/sorting/quick-sort" badge="Sorting" title="Quick Sort"
            desc="Pick a pivot, partition elements around it, then recurse on both sides."
            meta="O(n log n) · Unstable" demoSteps={quickSortSteps()} demoLabel="Quick Sort — live" />
          <AlgoCard href="/sorting/heap-sort" badge="Sorting" title="Heap Sort"
            desc="Build a max-heap, then repeatedly extract the maximum to sort the array."
            meta="O(n log n) · Unstable" demoSteps={heapSortSteps()} demoLabel="Heap Sort — live" />
        </div>
      </div>

      {/* Searching */}
      <div>
        <motion.h3
          className="font-display text-2xl tracking-wide mb-4 text-[var(--color-text-muted)]"
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >Searching</motion.h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AlgoCard href="/searching/binary-search" badge="Searching" title="Binary Search"
            desc="Efficiently find a target in a sorted array by eliminating half the search space each step."
            meta="O(log n) · O(1) space" demoSteps={binarySearchSteps()} demoLabel="Binary Search — live" />
        </div>
      </div>

      {/* Graph */}
      <div>
        <motion.h3
          className="font-display text-2xl tracking-wide mb-4 text-[var(--color-text-muted)]"
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >Graph</motion.h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AlgoCard href="/graph/bfs" badge="Graph" title="BFS"
            desc="Breadth-First Search explores all neighbors at the current depth before moving deeper."
            meta="O(V + E) · Queue" demoSteps={bfsSteps()} demoLabel="BFS — live" />
          <AlgoCard href="/graph/dfs" badge="Graph" title="DFS"
            desc="Depth-First Search explores as deep as possible before backtracking."
            meta="O(V + E) · Stack" demoSteps={dfsSteps()} demoLabel="DFS — live" />
          <AlgoCard href="/graph/dijkstra" badge="Graph" title="Dijkstra"
            desc="Find the shortest path from a source to all nodes in a weighted graph."
            meta="O((V+E) log V) · Greedy" demoSteps={dijkstraSteps()} demoLabel="Dijkstra — live" />
          <AlgoCard href="/graph/topo-sort" badge="Graph" title="Topological Sort"
            desc="Order nodes in a DAG so every edge goes from earlier to later in the ordering."
            meta="O(V + E) · Kahn's" demoSteps={topoSortSteps()} demoLabel="Topo Sort — live" />
        </div>
      </div>

      {/* Tree */}
      <div>
        <motion.h3
          className="font-display text-2xl tracking-wide mb-4 text-[var(--color-text-muted)]"
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >Tree</motion.h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AlgoCard href="/tree/bst" badge="Tree" title="BST"
            desc="Binary Search Tree — insert and delete values while maintaining the BST property."
            meta="O(log n) avg · O(n) worst" demoSteps={bstSteps()} demoLabel="BST Insert — live" />
          <AlgoCard href="/tree/avl" badge="Tree" title="AVL Tree"
            desc="Self-balancing BST with automatic rotations. Guarantees O(log n) height at all times."
            meta="O(log n) · Self-balancing" demoSteps={avlSteps()} demoLabel="AVL Rotation — live" />
          <AlgoCard href="/tree/seg-tree" badge="Tree" title="Segment Tree"
            desc="Efficient range queries and point updates on an array. Build, query, and update in O(log n)."
            meta="O(log n) · Range Queries" demoSteps={segTreeSteps()} demoLabel="Seg Tree — live" />
          <AlgoCard href="/tree/rb-tree" badge="Tree" title="Red-Black Tree"
            desc="Self-balancing BST with red/black coloring. Guarantees O(log n) via recoloring and rotations."
            meta="O(log n) · Color Rules" demoSteps={rbTreeSteps()} demoLabel="RB Insert — live" />
        </div>
      </div>

      {/* String */}
      <div>
        <motion.h3
          className="font-display text-2xl tracking-wide mb-4 text-[var(--color-text-muted)]"
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >String</motion.h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AlgoCard href="/string/kmp" badge="String" title="KMP Search"
            desc="Knuth-Morris-Pratt pattern matching. Never re-compare a character you already matched."
            meta="O(n + m) · LPS Table" demoSteps={kmpSteps()} demoLabel="KMP Search — live" />
        </div>
      </div>

      {/* Hashing */}
      <div>
        <motion.h3
          className="font-display text-2xl tracking-wide mb-4 text-[var(--color-text-muted)]"
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >Hashing</motion.h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AlgoCard href="/hashing/linear-probing" badge="Hashing" title="Linear Probing"
            desc="Hash table with linear probing — resolve collisions by checking the next slot sequentially."
            meta="O(1) avg · O(n) worst" demoSteps={hashTableSteps()} demoLabel="Linear Probing — live" />
          <AlgoCard href="/hashing/quadratic-probing" badge="Hashing" title="Quadratic Probing"
            desc="Hash table with quadratic probing — resolve collisions by jumping 1², 2², 3² slots ahead."
            meta="O(1) avg · Less clustering" demoSteps={hashTableSteps()} demoLabel="Quadratic Probing — live" />
        </div>
      </div>

      {/* Union-Find */}
      <div>
        <motion.h3
          className="font-display text-2xl tracking-wide mb-4 text-[var(--color-text-muted)]"
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >Union-Find</motion.h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AlgoCard href="/union-find" badge="Union-Find" title="Union-Find (DSU)"
            desc="Disjoint Set Union with path compression and union by rank. Nearly O(1) per operation."
            meta="O(α(n)) · Path Compression" demoSteps={unionFindSteps()} demoLabel="Union-Find — live" />
        </div>
      </div>

      {/* Tools */}
      <div>
        <motion.h3
          className="font-display text-2xl tracking-wide mb-4 text-[var(--color-text-muted)]"
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >Tools</motion.h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <a href="/tools/complexity" className="block p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-300 hover:border-[var(--color-accent)] hover:shadow-lg group">
            <div className="aspect-[3/2] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt,rgba(0,0,0,0.1))] p-3 flex items-center justify-center">
              <span className="text-3xl font-display text-[var(--color-accent)] opacity-60">O(n²)</span>
            </div>
            <div className="mt-3">
              <span className="inline-block text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] mb-2">Tool</span>
              <h4 className="font-display text-xl tracking-wide text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">Complexity Explorer</h4>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">Interactive chart comparing Big-O growth rates.</p>
              <p className="mt-2 text-xs font-mono text-[var(--color-text-muted)]">Big-O · Interactive</p>
            </div>
          </a>
          <a href="/tools/compare" className="block p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-300 hover:border-[var(--color-accent)] hover:shadow-lg group">
            <div className="aspect-[3/2] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt,rgba(0,0,0,0.1))] p-3 flex items-center justify-center gap-2">
              <span className="text-lg font-mono text-[var(--color-accent)] opacity-60">A</span>
              <span className="text-xs text-[var(--color-text-muted)]">vs</span>
              <span className="text-lg font-mono text-[var(--color-accent-secondary)] opacity-60">B</span>
            </div>
            <div className="mt-3">
              <span className="inline-block text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] mb-2">Tool</span>
              <h4 className="font-display text-xl tracking-wide text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">Compare Mode</h4>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">Run two sorting algorithms side by side on the same input.</p>
              <p className="mt-2 text-xs font-mono text-[var(--color-text-muted)]">Side-by-side · Sorting</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
