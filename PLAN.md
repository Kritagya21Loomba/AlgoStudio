# Phase 3 Implementation Plan

## Overview
Phase 3 adds **5 new algorithm visualizers** (Dijkstra, Topological Sort, Red-Black Trees, Segment Trees, KMP String Search) and **premium polish** (procedural grain, parallax, advanced animations). Each algorithm follows the established 6-file pattern.

---

## Feature 1: Dijkstra's Shortest Path

**Files to create/modify:**
- `src/algorithms/graph/dijkstra-types.ts` — Extended graph types with weighted edges (`weight: number` on `GraphEdge`), `DijkstraState` (distances map, previous map, priority queue, shortest path trace)
- `src/algorithms/graph/dijkstra.ts` — Algorithm implementation using min-priority queue, generates step-by-step relaxation steps
- `src/lib/graph-presets.ts` — Add weighted graph presets (weights on edges)
- `src/components/visualizer/DijkstraChart.tsx` — Extends GraphChart with edge weight labels, distance badges on nodes, shortest path highlighting
- `src/components/visualizer/DijkstraVisualizer.tsx` — Orchestrator with priority queue panel instead of frontier panel
- `src/components/visualizer/DijkstraVisualizerPage.tsx` — Slug resolver
- `src/pages/graph/dijkstra.astro` — Astro route
- Update: `types.ts` (add 'relax' action), `ActionBadge.tsx`, `Header.astro` (add to Graph dropdown), `AlgoIntro.tsx`, `index.astro` card grid, `algorithms/index.ts`, `MiniAlgoDemo.tsx` (add dijkstra steps)

## Feature 2: Topological Sort

**Files to create/modify:**
- `src/algorithms/graph/topo-sort.ts` — Kahn's algorithm (BFS-based), using in-degree counting. Generates steps showing in-degree tracking, zero-degree queue, node removal
- Reuses existing `GraphState` + `GraphInput` with `directed: true`
- `src/lib/graph-presets.ts` — Add DAG preset
- `src/components/visualizer/GraphVisualizerPage.tsx` — Add `'topo-sort'` to algorithm map (reuses GraphVisualizer since same chart type)
- `src/pages/graph/topo-sort.astro` — Astro route
- Update: `types.ts`, `ActionBadge.tsx`, `Header.astro`, `AlgoIntro.tsx`, card grid, exports, `MiniAlgoDemo.tsx`

## Feature 3: Red-Black Trees

**Files to create/modify:**
- `src/algorithms/tree/rbt-types.ts` — `RBTNodeData` (value, color: 'red'|'black', left, right, parent), `RBTState` (nodes with positions, edges, rotation info, color flips)
- `src/algorithms/tree/rbt.ts` — Insert with fix-up (uncle checks, rotations, recoloring), generates steps for each case (Case 1: recolor, Case 2: rotate, Case 3: rotate+recolor)
- `src/components/visualizer/RBTChart.tsx` — Tree chart with red/black node coloring, color-flip animations, rotation animations
- `src/components/visualizer/RBTInputControls.tsx` — Insert/Delete/Random/Reset controls
- `src/components/visualizer/RBTVisualizer.tsx` — Orchestrator following AVL pattern
- `src/components/visualizer/RBTVisualizerPage.tsx` — Slug resolver
- `src/pages/tree/rbt.astro` — Astro route
- Update: `types.ts` (add 'recolor' action), `ActionBadge.tsx`, `Header.astro` (add to Tree dropdown), `AlgoIntro.tsx`, card grid, exports, `MiniAlgoDemo.tsx`

## Feature 4: Segment Trees

**Files to create/modify:**
- `src/algorithms/tree/segtree-types.ts` — `SegTreeState` (array of nodes stored in flat array, ranges, query range, update targets, current node highlight)
- `src/algorithms/tree/segtree.ts` — Build, range query (sum), point update. Steps show tree building, then query/update traversal
- `src/components/visualizer/SegTreeChart.tsx` — Full binary tree visualization with range labels [l,r] on each node, value inside, highlighted query path
- `src/components/visualizer/SegTreeInputControls.tsx` — Array input, query range, point update controls
- `src/components/visualizer/SegTreeVisualizer.tsx` — Orchestrator
- `src/components/visualizer/SegTreeVisualizerPage.tsx` — Slug resolver
- `src/pages/tree/segment-tree.astro` — Astro route
- Update: `types.ts` (add 'query'/'update' actions, 'segment-tree' category), `ActionBadge.tsx`, `Header.astro`, `AlgoIntro.tsx`, card grid, exports, `MiniAlgoDemo.tsx`

## Feature 5: KMP String Search

**Files to create/modify:**
- `src/algorithms/string/types.ts` — `KMPState` (text, pattern, textIdx, patIdx, lps array, matches found, comparison highlights)
- `src/algorithms/string/kmp.ts` — LPS table construction + pattern matching. Steps show LPS building phase, then matching phase with shifts
- `src/components/visualizer/KMPChart.tsx` — Two-row character grid (text on top, sliding pattern below), character-by-character highlighting, LPS table display
- `src/components/visualizer/KMPInputControls.tsx` — Text + pattern input fields
- `src/components/visualizer/KMPVisualizer.tsx` — Orchestrator
- `src/components/visualizer/KMPVisualizerPage.tsx` — Slug resolver
- `src/pages/string/kmp.astro` — Astro route
- Update: `types.ts` (add 'match'/'mismatch'/'shift-pattern' actions, 'string' category), `ActionBadge.tsx`, `Header.astro` (add String dropdown), `AlgoIntro.tsx`, card grid, exports, `MiniAlgoDemo.tsx`

## Feature 6: Premium Polish

**Enhancements (not new pages):**
1. **Procedural grain overlay** — Upgrade `GrainOverlay.astro` with a subtle animated SVG noise filter that shifts over time (CSS animation on `<feTurbulence>` seed), giving the editorial grainy look
2. **Parallax hero** — Add subtle mouse-tracking parallax to the hero section decorative blobs and the mini bubble sort animation (track mouse position, offset elements proportionally)
3. **Page transition animations** — Add Astro view transitions with custom crossfade/slide animations between pages
4. **Micro-interactions** — Add hover scale+glow to all algo cards, button press feedback, smooth scroll-driven fade-in for the card grid sections using Intersection Observer
5. **Loading skeletons** — Replace "Loading..." text with animated skeleton placeholders that match the layout shape

---

## Implementation Order
1. Dijkstra (extends existing graph infrastructure)
2. Topological Sort (also graph-based, minimal new UI)
3. KMP String Search (entirely new category, straightforward visualization)
4. Segment Trees (new tree variant)
5. Red-Black Trees (most complex — 3 insert cases, recoloring + rotations)
6. Premium Polish (applied across the whole site)

## Shared Updates (done once, accumulated across features)
- `src/algorithms/types.ts` — new action types and categories
- `src/components/ui/ActionBadge.tsx` — new action configs
- `src/components/layout/Header.astro` — new nav items
- `src/components/ui/AlgoIntro.tsx` — new intro entries
- `src/components/landing/AlgoCardGrid.tsx` — new cards
- `src/components/landing/MiniAlgoDemo.tsx` — new step sequences
- `src/algorithms/index.ts` — new exports
