import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AlgoIntroProps {
  slug: string;
  name: string;
  onDismiss: () => void;
}

interface IntroContent {
  tagline: string;
  concept: string;
  howItWorks: string[];
  visual: string; // ASCII-style visual representation
  funFact?: string;
}

const intros: Record<string, IntroContent> = {
  'bubble-sort': {
    tagline: 'The simplest sort: let big values bubble up!',
    concept:
      'Imagine bubbles rising in water. Bigger bubbles rise faster. Bubble Sort repeatedly walks through the list, compares neighbors, and swaps them if they\'re in the wrong order. After each pass, the largest unsorted element "bubbles" to its correct position at the end.',
    howItWorks: [
      'Walk left to right comparing adjacent pairs',
      'If left > right, swap them',
      'After each full pass, one more element is in its final place',
      'Repeat until no swaps are needed',
    ],
    visual: `  [  ?  ?  ?  ?  ?  ]     unsorted
   \u2191  \u2191
  compare neighbors

  [ smaller | bigger ]    swap if needed

  [  ?  ?  ?  ?  \u2714  ]     biggest bubbles to end
  [  ?  ?  ?  \u2714  \u2714  ]     repeat...
  [  \u2714  \u2714  \u2714  \u2714  \u2714  ]     done!`,
  },
  'insertion-sort': {
    tagline: 'Sort like you sort a hand of cards.',
    concept:
      'Think of picking up playing cards one at a time. Each new card gets inserted into the correct position in your already-sorted hand. Insertion Sort works the same way: it grows a sorted portion from left to right, picking up each element and sliding it into place.',
    howItWorks: [
      'Start with the first element as the "sorted hand"',
      'Pick up the next element (the "key")',
      'Shift larger elements right to make room',
      'Insert the key into its correct position',
    ],
    visual: `  sorted  | unsorted
  [ \u2714  \u2714 ] | [ key  ?  ?  ]
       \u2190\u2190\u2190\u2190
    slide to find     pick up key
    correct spot      and insert

  [ \u2714  \u2714  \u2714 ] | [ ?  ?  ]  sorted grows!`,
  },
  'selection-sort': {
    tagline: 'Find the minimum, put it in place. Repeat.',
    concept:
      'Like picking the shortest person from a line and moving them to the front, then the next shortest, and so on. Selection Sort scans the unsorted portion to find the minimum, swaps it into the next sorted position, and repeats.',
    howItWorks: [
      'Assume the first unsorted element is the minimum',
      'Scan the rest to find the actual minimum',
      'Swap the minimum into the next sorted position',
      'Move the sorted boundary one step right',
    ],
    visual: `  sorted | unsorted
  [     ] | [ ?  ?  ?  ?  ?  ]
              scan \u2192\u2192\u2192\u2192\u2192
              find MIN!

  [ MIN ] | [ ?  ?  ?  ?  ]  swap to front
  [ \u2714 \u2714 ] | [ ?  ?  ?  ]  repeat...`,
  },
  'merge-sort': {
    tagline: 'Divide and conquer: split, sort, merge.',
    concept:
      'Imagine tearing a phone book in half, then tearing each half in half, until you have single pages. Then merge pairs of pages back together in order. Merge Sort splits the array recursively until each piece has one element, then merges them back in sorted order.',
    howItWorks: [
      'Split the array in half recursively',
      'Keep splitting until each piece has 1 element',
      'Merge pairs back together in sorted order',
      'Each merge combines two sorted halves into one sorted whole',
    ],
    visual: `      [ ? ? ? ? ? ? ? ? ]      full array
       /                \\
   [ ? ? ? ? ]    [ ? ? ? ? ]    split
    /      \\        /      \\
  [? ?]  [? ?]  [? ?]  [? ?]    split again

  [\u2714 \u2714]  [\u2714 \u2714]  [\u2714 \u2714]  [\u2714 \u2714]    merge pairs
      [\u2714 \u2714 \u2714 \u2714]    [\u2714 \u2714 \u2714 \u2714]    merge again
          [\u2714 \u2714 \u2714 \u2714 \u2714 \u2714 \u2714 \u2714]      done!`,
  },
  'quick-sort': {
    tagline: 'Pick a pivot, partition around it.',
    concept:
      'Choose one element as a "pivot." Put everything smaller on the left and everything larger on the right. The pivot is now in its correct final position! Recursively do the same for the left and right partitions.',
    howItWorks: [
      'Choose a pivot element (often the last)',
      'Partition: move smaller elements left, larger right',
      'The pivot lands in its correct sorted position',
      'Recursively sort the left and right partitions',
    ],
    visual: `  [ ?  ?  ? | PIVOT | ?  ?  ? ]

    < pivot    PIVOT    > pivot
  [ smaller ] [ \u2714 ] [ larger ]

  recurse      done!    recurse
  on left              on right`,
  },
  'heap-sort': {
    tagline: 'Build a heap, extract the max repeatedly.',
    concept:
      'Imagine a tournament bracket where the winner (largest) always rises to the top. Heap Sort first arranges the array into a "max heap" where the parent is always larger than its children. Then it repeatedly extracts the maximum and places it at the end.',
    howItWorks: [
      'Build a max-heap from the array',
      'The largest element is at the root (index 0)',
      'Swap it with the last unsorted element',
      'Shrink the heap by one and re-heapify',
    ],
    visual: `       [ MAX ]           max-heap
      /       \\
    [  ]     [  ]         parent > children
   /  \\     /  \\
  [] [] [] []

  swap MAX to end \u2192 [ ? ? ? ... \u2714 ]
  re-heapify and repeat!`,
  },
  'binary-search': {
    tagline: 'Half the search space every step.',
    concept:
      'Like guessing a number between 1 and 100 with "higher/lower" hints. Instead of checking every element, you look at the middle. If it\'s too small, eliminate the left half. Too big? Eliminate the right. Each step cuts the remaining elements in half.',
    howItWorks: [
      'Array must be sorted',
      'Look at the middle element',
      'If it matches the target, done!',
      'If too small, search the right half; if too big, search the left half',
    ],
    visual: `  [ ?  ?  ?  ?  M  ?  ?  ?  ? ]
                 \u2191
              check middle

  target > M? \u2192 search right half
  target < M? \u2192 search left half
  target = M? \u2192 FOUND!`,
  },
  'bfs': {
    tagline: 'Explore layer by layer, like ripples in a pond.',
    concept:
      'Drop a stone in a pond and watch the ripples spread outward in circles. BFS explores a graph the same way: first visit the start node, then all its neighbors, then all their neighbors, and so on. It uses a queue (first-in, first-out) to ensure level-by-level exploration.',
    howItWorks: [
      'Start at the source node, add it to a queue',
      'Dequeue the front node and visit it',
      'Enqueue all unvisited neighbors',
      'Repeat until the queue is empty',
    ],
    visual: `     [ START ]         layer 0
      / | \\
    [A] [B] [C]        layer 1
    / \\    |
  [D] [E] [F]          layer 2

  Queue: [START] \u2192 [A,B,C] \u2192 [D,E,F]`,
  },
  'dfs': {
    tagline: 'Go deep before going wide.',
    concept:
      'Like exploring a maze by always taking the next unexplored path and going as deep as possible before backtracking. DFS uses a stack to dive deep into one branch before exploring others.',
    howItWorks: [
      'Start at the source node, push it on a stack',
      'Pop the top node and visit it',
      'Push all unvisited neighbors onto the stack',
      'Repeat until the stack is empty',
    ],
    visual: `     [ START ]
      |
      v
     [A] \u2192 [B] \u2192 [D]    go deep!
                       |
                    backtrack
                       |
              [C] \u2192 [E]      keep going

  Stack: [START] \u2192 [A] \u2192 [B] \u2192 [D] \u2192 back...`,
  },
  'bst': {
    tagline: 'A tree where left is smaller, right is bigger.',
    concept:
      'A Binary Search Tree organizes values so that for every node, all values in the left subtree are smaller and all in the right are larger. This makes searching, inserting, and deleting efficient by eliminating half the tree at each step.',
    howItWorks: [
      'Compare the value with the current node',
      'If smaller, go left; if larger, go right',
      'For insert: place at the empty spot you reach',
      'For delete: handle 3 cases (leaf, one child, two children)',
    ],
    visual: `         [ 50 ]
        /       \\
     [30]       [70]
    /    \\     /    \\
  [20]  [40] [60]  [80]

  Insert 35: 50\u219230\u219240\u2192left = [35]
  Always: left < parent < right`,
  },
  'avl': {
    tagline: 'A self-balancing BST — never let it get lopsided!',
    concept:
      'An AVL tree is a Binary Search Tree that automatically rebalances itself after every insertion or deletion. Each node tracks a "balance factor" (left height minus right height). If any node\'s balance factor goes beyond -1 or +1, the tree performs rotations to restore balance, guaranteeing O(log n) operations.',
    howItWorks: [
      'Insert like a normal BST',
      'Walk back up, checking each ancestor\'s balance factor',
      'If |balance| > 1, the node is unbalanced',
      'Apply the correct rotation: LL, RR, LR, or RL',
    ],
    visual: `  Unbalanced (LL):     After right rotation:
       [30]                 [20]
       /                   /    \\
     [20]               [10]   [30]
     /
   [10]

  Balance factors: -1, 0, +1 = OK
                   -2, +2    = ROTATE!`,
  },
  'seg-tree': {
    tagline: 'Answer range queries in O(log n) time.',
    concept:
      'A Segment Tree is a binary tree where each node stores aggregate information (like sum, min, or max) over a range of the array. It enables efficient range queries and point updates, both in O(log n) time. The root covers the entire array; each leaf stores one element.',
    howItWorks: [
      'Build: recursively split the array in half, computing sums bottom-up',
      'Query: traverse only nodes whose ranges overlap the query range',
      'Update: change a leaf and propagate new sums up to the root',
      'Space: stored in a flat array of size 4n (1-indexed)',
    ],
    visual: `         [36]           sum [0,5]
        /       \\
     [9]        [27]       sums of halves
    /   \\      /   \\
  [4]  [5]  [16] [11]     smaller ranges
  / \\   |   / \\    |
 1   3  5  7   9  11      leaves = array

  Query [1,4]: visit [9] + [16] = 25
  Update arr[2]=10: leaf\u219210, parent\u219213, root\u219240`,
  },
  'rb-tree': {
    tagline: 'Self-balancing BST with red and black coloring rules.',
    concept:
      'A Red-Black Tree is a self-balancing BST where each node is colored red or black. By enforcing five properties (root is black, red nodes have black children, all paths have equal black-node count, etc.), the tree guarantees O(log n) height. On insert, fix-up uses recoloring and rotations.',
    howItWorks: [
      'Insert as a red node using standard BST insertion',
      'If parent is red, apply fix-up cases',
      'Case 1: Uncle is red \u2192 recolor parent, uncle, grandparent',
      'Cases 2-3: Uncle is black \u2192 rotate and recolor',
    ],
    visual: `       [20 B]
      /       \\
   [10 R]    [30 R]
   /    \\       \\
 [5 B] [15 B]  [25 B]

  Insert 1: new RED leaf under 5
  5 is RED, uncle 15 is RED \u2192 Case 1
  Recolor: 5=B, 15=B, 10=R
  Root stays BLACK`,
  },
  'topo-sort': {
    tagline: 'Order tasks so dependencies come first.',
    concept:
      'Topological Sort produces a linear ordering of nodes in a directed acyclic graph (DAG) such that for every directed edge u\u2192v, node u appears before v. It\'s essential for scheduling tasks with dependencies — like course prerequisites or build systems.',
    howItWorks: [
      'Compute in-degree (number of incoming edges) for each node',
      'Enqueue all nodes with in-degree 0 (no dependencies)',
      'Dequeue a node, add it to the ordering, and decrement in-degrees of its neighbors',
      'When a neighbor\'s in-degree reaches 0, enqueue it',
    ],
    visual: `  DAG:  A \u2192 C \u2192 F
         \\        \u2191
          D \u2192 G
         /
    B \u2192 E \u2192 G

  In-degrees: A=0 B=0 C=1 D=2 E=1 F=2 G=2
  Order: A, B, C, D, E, F, G`,
  },
  'dijkstra': {
    tagline: 'Find the shortest path from one node to all others.',
    concept:
      'Dijkstra\'s algorithm finds the shortest path from a source node to every other node in a weighted graph. It greedily picks the closest unvisited node, then "relaxes" its neighbors — updating their distance if a shorter path is found through the current node.',
    howItWorks: [
      'Set distance to source = 0, all others = \u221E',
      'Pick the unvisited node with the smallest distance',
      'For each neighbor, check if going through current node is shorter',
      'If shorter, update the distance (relax the edge)',
    ],
    visual: `     [A] --5-- [B] --2-- [D]
      |          |          |
      3          1          4
      |          |          |
     [C] --6-- [E] --3-- [F]

  Source = A
  dist[A]=0  dist[B]=5  dist[C]=3
  Relax B\u2192D: dist[D] = 5+2 = 7
  Relax C\u2192E: dist[E] = 3+6 = 9`,
  },
  'kmp': {
    tagline: 'Never re-compare a character you already matched.',
    concept:
      'The Knuth-Morris-Pratt (KMP) algorithm searches for a pattern in a text by pre-computing a "failure function" (LPS table) that tells it how far to shift the pattern on a mismatch, avoiding redundant comparisons. It achieves O(n + m) time regardless of the input.',
    howItWorks: [
      'Build the LPS (Longest Proper Prefix-Suffix) table for the pattern',
      'Slide the pattern along the text, comparing characters',
      'On a match, advance both pointers',
      'On a mismatch, use the LPS to shift the pattern without backtracking in the text',
    ],
    visual: `  Text:    A B A B D A B A B C A B A B
  Pattern: A B A B C
                   \u2191 mismatch at C vs D

  LPS table: [0, 0, 1, 2, 0]
  Shift pattern by LPS[3] = 2:

  Text:    A B A B D A B A B C A B A B
  Pattern:     A B A B C
  No backtracking in text!`,
  },
  'hash-table-linear': {
    tagline: 'Map keys to slots with simple arithmetic.',
    concept:
      'A hash table stores key-value pairs by computing an index from the key using a hash function (key mod tableSize). When two keys hash to the same slot (a collision), linear probing searches for the next empty slot by checking index+1, index+2, and so on.',
    howItWorks: [
      'Compute h(key) = key mod tableSize',
      'If the slot is empty, insert there',
      'If occupied (collision), try the next slot: (h+1), (h+2), ...',
      'Repeat until an empty slot is found',
    ],
    visual: `  h(22) = 22 mod 7 = 1

  [0]  [1]  [2]  [3]  [4]  [5]  [6]
       22

  h(15) = 15 mod 7 = 1  \u2190 collision!
  try 2, try 3... insert at 2

  [0]  [1]  [2]  [3]  [4]  [5]  [6]
       22   15`,
  },
  'hash-table-quadratic': {
    tagline: 'Spread collisions out with quadratic jumps.',
    concept:
      'Quadratic probing is like linear probing, but instead of checking the next slot sequentially, it jumps by increasing squares: h+1\u00B2, h+2\u00B2, h+3\u00B2, etc. This helps avoid the "clustering" problem where many consecutive slots fill up.',
    howItWorks: [
      'Compute h(key) = key mod tableSize',
      'If the slot is empty, insert there',
      'If collision, probe (h+1\u00B2), (h+2\u00B2), (h+3\u00B2), ...',
      'Jump sizes grow: 1, 4, 9, 16, ... avoiding clusters',
    ],
    visual: `  h(22) = 22 mod 7 = 1

  Collision at 1? Try:
    (1 + 1\u00B2) mod 7 = 2
    (1 + 2\u00B2) mod 7 = 5
    (1 + 3\u00B2) mod 7 = 3

  Jumps:  +1  +4  +9  +16 ...
  Avoids clustering!`,
  },
  'union-find': {
    tagline: 'Track connected components efficiently.',
    concept:
      'Union-Find (Disjoint Set Union) tracks a collection of non-overlapping sets. It supports two operations: Union merges two sets, and Find determines which set an element belongs to. With union by rank and path compression, both operations run in nearly O(1) amortized time.',
    howItWorks: [
      'Each element starts in its own set (parent = self)',
      'Find(x): follow parent pointers to the root',
      'Path compression: point every node on the path directly to root',
      'Union(x,y): link the root of smaller-rank tree under larger-rank tree',
    ],
    visual: `  Before Union(0,2):      After Union:
    {0,1}  {2,3}            {0,1,2,3}
      0      2                  0
      |      |                / | \\
      1      3               1  2  3

  Find(3) with compression:
    3 \u2192 2 \u2192 0  \u2192  3 \u2192 0 (direct!)`,
  },
};

export function AlgoIntro({ slug, name, onDismiss }: AlgoIntroProps) {
  const intro = intros[slug];
  if (!intro) {
    onDismiss();
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onDismiss}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Modal */}
        <motion.div
          className="relative max-w-xl w-full rounded-2xl overflow-hidden"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-3">
            <h2 className="font-display text-3xl tracking-wide text-[var(--color-text)]">
              {name}
            </h2>
            <p
              className="text-sm font-mono mt-1"
              style={{ color: 'var(--color-accent-secondary)' }}
            >
              {intro.tagline}
            </p>
          </div>

          {/* Content */}
          <div className="px-6 pb-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Concept */}
            <p className="text-sm text-[var(--color-text)] leading-relaxed">
              {intro.concept}
            </p>

            {/* Visual */}
            <pre
              className="text-xs font-mono leading-relaxed p-4 rounded-lg overflow-x-auto"
              style={{
                backgroundColor: 'var(--color-surface-alt, rgba(0,0,0,0.2))',
                color: 'var(--color-accent-secondary)',
                border: '1px solid var(--color-border)',
              }}
            >
              {intro.visual}
            </pre>

            {/* How it works */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                How it works
              </h3>
              <ol className="space-y-1">
                {intro.howItWorks.map((step, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-2 text-sm text-[var(--color-text)]"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                  >
                    <span
                      className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono font-bold mt-0.5"
                      style={{
                        backgroundColor: 'var(--color-accent-secondary)',
                        color: '#fff',
                      }}
                    >
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </motion.li>
                ))}
              </ol>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-2 flex justify-end">
            <motion.button
              onClick={onDismiss}
              className="px-5 py-2 rounded-lg font-mono text-sm font-semibold cursor-pointer"
              style={{
                backgroundColor: 'var(--color-accent-secondary)',
                color: '#fff',
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Start Visualizing
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
