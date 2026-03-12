<div align="center">

# A+DS — Algorithms & Data Structures Visualizer

**See algorithms come alive.** Interactive step-by-step visualizations with synced pseudocode, complexity analysis, and editorial-grade design.

Built with Astro 6 + React 19 + TypeScript + Tailwind CSS v4 + Framer Motion + Zustand

[Live Demo](#) · [Report Bug](https://github.com/Kritagya21Loomba/AlgoStudio/issues) · [Request Feature](https://github.com/Kritagya21Loomba/AlgoStudio/issues)

</div>

---

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [All 22 Pages](#all-22-pages)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Design System](#design-system)
- [How Algorithms Work Under the Hood](#how-algorithms-work-under-the-hood)
- [Development Phases](#development-phases)
- [Deployment](#deployment)
- [License](#license)

---

## About the Project

A+DS is a comprehensive, interactive companion site for learning algorithms and data structures. Every algorithm is visualized with animated SVG charts, synced pseudocode highlighting, playback controls (play/pause/step-forward/step-back), and real-time complexity analysis — all wrapped in a premium, editorial-inspired UI.

This project was built from scratch across three major development phases, growing from 6 sorting visualizers to a full 22-page platform covering sorting, searching, graph algorithms, trees, hashing, string matching, and interactive tools.

### Why I Built This

Most algorithm visualizers on the web feel like afterthoughts — clunky UIs, no step-back functionality, no synced pseudocode, and no design polish. I wanted to build something that felt like a premium editorial product: something you'd actually _want_ to use while studying algorithms.

### Key Design Principles

- **Step-back support** — Every algorithm uses pre-computed step arrays (not generators), so you can instantly jump to any step
- **Synced pseudocode** — Each step highlights the exact lines of pseudocode being executed
- **Stable animations** — Array elements carry unique IDs through swaps for butter-smooth Framer Motion transitions
- **Three themes** — Light, Dark, and Beige, all driven by CSS custom properties
- **Zero loading flash** — Synchronous initialization via `useRef` pattern prevents the "Loading..." flash on first render

---

## Features

### Core Visualizer Features
- **Play/Pause/Step** — Full playback controls with adjustable speed (0.5x to 4x)
- **Step-Back** — Jump to any previous step instantly (pre-computed step arrays)
- **Synced Pseudocode** — Active pseudocode lines highlight in real-time
- **Complexity Panel** — Time and space complexity displayed alongside every algorithm
- **Action Badges** — Color-coded badges showing the current operation (compare, swap, merge, rotate, etc.)
- **Color Legend** — Every visualization includes a color-coded legend

### Landing Page
- **Animated Hero** — Parallax scroll effect with live bubble sort animation
- **Mini Algorithm Demos** — Every algorithm card on the home page has a live looping animation with step annotations
- **Scroll Animations** — Cards and section headings animate in on scroll using `whileInView`
- **Hover Micro-interactions** — Cards lift on hover with smooth spring physics

### Polish
- **Grain Texture Overlay** — Procedural noise overlay across all pages for editorial feel
- **View Transitions** — Smooth fade-in/fade-out page transitions via Astro's `ClientRouter`
- **Glass Morphism** — Header and cards use backdrop-blur with semi-transparent backgrounds
- **Three Themes** — Dark (default), Light, and Beige — toggled via header button, persisted in localStorage
- **Custom Scrollbars** — Styled scrollbar tracks and thumbs matching the theme

---

## All 22 Pages

### Sorting Algorithms (6)
| Algorithm | Path | Complexity | Key Concept |
|---|---|---|---|
| Bubble Sort | `/sorting/bubble-sort` | O(n²) | Adjacent pair comparison & swap |
| Insertion Sort | `/sorting/insertion-sort` | O(n²) | Build sorted portion left-to-right |
| Selection Sort | `/sorting/selection-sort` | O(n²) | Find minimum, swap to front |
| Merge Sort | `/sorting/merge-sort` | O(n log n) | Divide, recurse, merge |
| Quick Sort | `/sorting/quick-sort` | O(n log n) | Pivot partitioning |
| Heap Sort | `/sorting/heap-sort` | O(n log n) | Max-heap extraction |

### Searching (1)
| Algorithm | Path | Complexity | Key Concept |
|---|---|---|---|
| Binary Search | `/searching/binary-search` | O(log n) | Halve search space each step |

### Graph Algorithms (4)
| Algorithm | Path | Complexity | Key Concept |
|---|---|---|---|
| BFS | `/graph/bfs` | O(V + E) | Queue-based layer-by-layer exploration |
| DFS | `/graph/dfs` | O(V + E) | Stack-based deep exploration |
| Dijkstra | `/graph/dijkstra` | O((V+E) log V) | Greedy shortest path with relaxation |
| Topological Sort | `/graph/topo-sort` | O(V + E) | Kahn's algorithm on DAGs |

### Tree Data Structures (4)
| Algorithm | Path | Complexity | Key Concept |
|---|---|---|---|
| BST | `/tree/bst` | O(log n) avg | Insert/delete with BST property |
| AVL Tree | `/tree/avl` | O(log n) | Self-balancing with rotations (LL, RR, LR, RL) |
| Red-Black Tree | `/tree/rb-tree` | O(log n) | Color-based balancing with fix-up cases |
| Segment Tree | `/tree/seg-tree` | O(log n) | Range queries and point updates |

### String Matching (1)
| Algorithm | Path | Complexity | Key Concept |
|---|---|---|---|
| KMP Search | `/string/kmp` | O(n + m) | LPS failure function, no backtracking |

### Hashing (2)
| Algorithm | Path | Complexity | Key Concept |
|---|---|---|---|
| Linear Probing | `/hashing/linear-probing` | O(1) avg | Sequential collision resolution |
| Quadratic Probing | `/hashing/quadratic-probing` | O(1) avg | Quadratic-jump collision resolution |

### Other Data Structures (1)
| Algorithm | Path | Complexity | Key Concept |
|---|---|---|---|
| Union-Find (DSU) | `/union-find` | O(α(n)) | Path compression + union by rank |

### Interactive Tools (2)
| Tool | Path | Description |
|---|---|---|
| Complexity Explorer | `/tools/complexity` | Interactive Big-O growth curve chart with toggleable curves |
| Compare Mode | `/tools/compare` | Side-by-side sorting algorithm comparison on same input |

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **[Astro 6](https://astro.build)** | Static site generator with island architecture |
| **[React 19](https://react.dev)** | Interactive UI components (islands) |
| **[TypeScript](https://typescriptlang.org)** | Type safety across all algorithm logic and components |
| **[Tailwind CSS v4](https://tailwindcss.com)** | Utility-first styling with CSS custom properties |
| **[Framer Motion](https://motion.dev)** | Spring-physics animations, scroll-driven parallax, layout animations |
| **[Zustand](https://zustand-demo.pmnd.rs)** | Lightweight state management for visualizer playback |
| **[pnpm](https://pnpm.io)** | Fast, disk-efficient package manager |

### Why This Stack?

- **Astro** was chosen for its static-first approach — algorithms don't need a server, so shipping zero JS by default and hydrating only the interactive islands gives excellent performance
- **React** for the interactive visualizer components — the ecosystem (Framer Motion, Zustand) is unmatched for complex animated UIs
- **SVG + Framer Motion** over Canvas — SVG gives us individual DOM elements per bar/node, which Framer Motion can animate independently with spring physics. Canvas would be faster for 10,000+ elements but SVG is far better for the 5-50 element educational visualizations here
- **Zustand** over Redux/Context — minimal boilerplate, perfect for the simple play/pause/step state machine. A single store for the main visualizer, a separate store for Compare Mode
- **Pre-computed step arrays** over generators — generators are memory-efficient but can't step backwards. Pre-computing all steps into an array enables instant random access to any step

---

## Architecture

### The 6-File Algorithm Pattern

Every algorithm follows a consistent 6-file pattern:

```
src/algorithms/{category}/types.ts          → State & input type definitions
src/algorithms/{category}/{algorithm}.ts    → Step generation logic
src/components/visualizer/{Name}Chart.tsx   → SVG visualization component
src/components/visualizer/{Name}Visualizer.tsx → Orchestrator (layout + controls + chart)
src/components/visualizer/{Name}VisualizerPage.tsx → Slug resolver + AlgoIntro modal
src/pages/{category}/{slug}.astro           → Astro route (static page shell)
```

### Data Flow

```
User Input → Algorithm.generateSteps(input) → AlgorithmStep<TState>[]
                                                     ↓
                                              Zustand Store (steps[], currentStepIndex)
                                                     ↓
                                    ┌────────────────┼────────────────┐
                                    ↓                ↓                ↓
                              Chart Component   PseudocodePanel   ActionBadge
                              (SVG visualization) (highlighted lines) (step description)
```

### Key Types

```typescript
interface Algorithm<TState, TInput> {
  meta: AlgorithmMeta;
  generateSteps(input: TInput): AlgorithmStep<TState>[];
}

interface AlgorithmStep<TState> {
  state: TState;           // Full visualization state at this step
  activeLines: number[];   // Pseudocode lines to highlight
  description: string;     // Human-readable step description
  action: string;          // Action type (compare, swap, merge, rotate, etc.)
}
```

### Zustand Store Architecture

```
visualizer-store.ts (singleton)
├── steps: AlgorithmStep[]
├── currentStepIndex: number
├── isPlaying: boolean
├── speed: number
├── loadAlgorithm() → reset state with new steps
├── stepForward() / stepBack()
├── play() / pause()
└── goToStep(index)

compare-store.ts (dual-panel)
├── left: { steps[], currentStepIndex }
├── right: { steps[], currentStepIndex }
├── isPlaying, speed
└── stepForward() → advances both panels independently
```

---

## Project Structure

```
AlgoStudio/
├── public/
│   ├── favicon.svg
│   ├── noise.svg                    # Grain texture overlay
│   └── sw.js                       # Service worker
├── src/
│   ├── algorithms/                  # Pure algorithm logic (no React)
│   │   ├── types.ts                 # Shared Algorithm<TState, TInput> interface
│   │   ├── index.ts                 # Barrel exports
│   │   ├── sorting/                 # Bubble, insertion, selection, merge, quick, heap
│   │   ├── searching/               # Binary search
│   │   ├── graph/                   # BFS, DFS, Dijkstra, Topo sort
│   │   ├── tree/                    # BST, AVL, Segment tree, Red-Black tree
│   │   ├── hashing/                 # Linear probing, quadratic probing
│   │   ├── string/                  # KMP
│   │   └── union-find/              # Union-Find (DSU)
│   ├── components/
│   │   ├── landing/                 # Hero, AlgoCardGrid, MiniAlgoDemo
│   │   ├── layout/                  # Header
│   │   ├── ui/                      # ThemeToggle, AlgoIntro, ActionBadge, ColorLegend, etc.
│   │   └── visualizer/              # All *Chart, *Visualizer, *VisualizerPage components
│   ├── hooks/
│   │   ├── useAlgorithmPlayer.ts    # Interval-based playback hook
│   │   └── useComparePlayer.ts      # Playback hook for Compare Mode
│   ├── layouts/
│   │   ├── BaseLayout.astro         # Root HTML shell (head, theme script, grain overlay)
│   │   └── VisualizerLayout.astro   # BaseLayout + Header
│   ├── lib/
│   │   ├── complexity-data.ts       # Big-O growth functions for Complexity Explorer
│   │   └── graph-presets.ts         # Pre-built graph layouts (small, medium, tree-like, dag)
│   ├── pages/                       # Astro file-based routing (22 pages)
│   ├── stores/
│   │   ├── visualizer-store.ts      # Main singleton Zustand store
│   │   └── compare-store.ts        # Dual-panel store for Compare Mode
│   └── styles/
│       ├── global.css               # Tailwind imports, base styles, view transitions
│       └── theme.css                # CSS custom properties for light/dark/beige themes
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

**130 source files** — 32 algorithm files, 60 React components, plus layouts, hooks, stores, and styles.

---

## Getting Started

### Prerequisites

- **Node.js** >= 22.12.0
- **pnpm** (recommended) — `npm install -g pnpm`

### Installation

```bash
# Clone the repository
git clone https://github.com/Kritagya21Loomba/AlgoStudio.git
cd AlgoStudio

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The dev server runs at `http://localhost:3000`.

### Build for Production

```bash
# Build static site to dist/
pnpm build

# Preview the production build locally
pnpm preview
```

---

## Design System

### Themes

Three themes controlled by a `data-theme` attribute on `<html>`, persisted in `localStorage`:

| Theme | Background | Accent | Feel |
|---|---|---|---|
| **Dark** (default) | `#0f0f0f` | `#ff6b6b` | Modern, high-contrast |
| **Light** | `#f5f0eb` | `#e63946` | Clean, paper-like |
| **Beige** | `#e8dfd0` | `#c44536` | Warm, editorial |

### Typography

| Font | Usage |
|---|---|
| **Bebas Neue** | Display headings (h1, section titles) |
| **Inter** | Body text, descriptions |
| **JetBrains Mono** | Code, pseudocode, badges, metadata |

### Color Tokens

All colors use CSS custom properties that swap on theme change:
- `--color-bg` / `--color-surface` / `--color-surface-alt` — backgrounds
- `--color-text` / `--color-text-muted` — text
- `--color-accent` / `--color-accent-secondary` — primary/secondary brand colors
- `--color-highlight` — yellow emphasis (comparisons, active elements)
- `--color-success` — green (completed, found, sorted)
- `--color-border` — subtle borders
- `--color-glass` / `--color-glass-border` — glassmorphism panels

---

## How Algorithms Work Under the Hood

### Step Generation (Example: Bubble Sort)

```typescript
// 1. The algorithm takes an input and produces steps
const steps = bubbleSort.generateSteps([5, 3, 8, 1, 2]);

// 2. Each step is a complete snapshot of the visualization state
steps[4] = {
  state: {
    bars: [
      { id: 'el-0', value: 3, status: 'default' },
      { id: 'el-1', value: 5, status: 'comparing' },
      { id: 'el-2', value: 1, status: 'comparing' },
      // ...
    ]
  },
  activeLines: [3, 4],              // Pseudocode lines to highlight
  description: 'Compare 5 and 1',   // Human-readable description
  action: 'compare',                // Action badge type
};

// 3. The store holds the steps array and a currentStepIndex
// 4. Stepping forward/back just increments/decrements the index
// 5. The chart component renders whatever state[currentStepIndex] contains
```

### The useRef Sync Init Pattern

To avoid a "Loading..." flash on first render, all visualizers use this pattern:

```typescript
const initialized = useRef(false);

// Runs synchronously during first render (before paint)
if (!initialized.current) {
  initialized.current = true;
  const steps = algorithm.generateSteps(defaultInput);
  loadAlgorithm(steps, algorithm.meta, []);
}

// Also runs on mount for re-mount cases
useEffect(() => {
  const steps = algorithm.generateSteps(defaultInput);
  loadAlgorithm(steps, algorithm.meta, []);
}, [algorithm]);
```

### SVG ID Namespacing (Compare Mode)

When two BarCharts render side-by-side in Compare Mode, SVG `<defs>` IDs would collide. The `instanceId` prop namespaces all IDs:

```typescript
// BarChart receives instanceId="cmp-left" or "cmp-right"
const sid = instanceId ? `${instanceId}-` : '';
const ID_SWAP_GLOW = `${sid}swap-glow`;    // "cmp-left-swap-glow"
const ID_ARR_R = `${sid}arr-r`;            // "cmp-left-arr-r"
```

---

## Development Phases

### Phase 1 — Foundation (12 pages)
- Core architecture: Algorithm interface, Zustand store, playback hooks
- 6 sorting algorithms with BarChart SVG visualization
- Binary search with elimination visualization
- BFS and DFS with graph visualization
- BST with tree layout and insert/delete
- Landing page with animated hero
- Three-theme design system (Dark, Light, Beige)
- Grain texture overlay, glassmorphism header

### Phase 2 — Expansion (17 pages)
- AVL Trees with rotation visualization (LL, RR, LR, RL)
- Hash Tables: linear probing and quadratic probing with collision visualization
- Union-Find with forest layout, path compression, union by rank
- Complexity Explorer: interactive Big-O growth curve chart
- Compare Mode: side-by-side sorting comparison with shared playback
- Mini algorithm demos on every landing page card
- AlgoIntro modal with concept explanation + ASCII visual for each algorithm

### Phase 3 — Advanced Algorithms + Polish (22 pages)
- Dijkstra's shortest path with weighted graph, priority queue display, distance table
- Topological Sort (Kahn's algorithm) with DAG preset
- KMP String Search with LPS table visualization and character grid
- Segment Tree with build/query/update and range highlighting
- Red-Black Tree with insert fix-up cases, red/black node coloring
- Premium polish: parallax hero, view transitions, scroll animations, hover micro-interactions, loading skeletons

---

## Deployment

This is a static site — no server required. Deploy the `dist/` folder to any static host.

### Recommended: Cloudflare Pages (free, unlimited bandwidth)

1. Push to GitHub
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages → Create
3. Connect your GitHub repo
4. Settings:
   - **Framework preset**: Astro
   - **Build command**: `pnpm build`
   - **Output directory**: `dist`
5. Deploy — auto-deploys on every push

### Alternative Free Options

| Platform | Bandwidth | Setup |
|---|---|---|
| **Vercel** | 100 GB/mo | `vercel` CLI or GitHub import |
| **Netlify** | 100 GB/mo | `netlify deploy --dir=dist` |
| **GitHub Pages** | 100 GB/mo | GitHub Actions workflow |

---

## License

This project is open source. Feel free to use it for learning, teaching, or building upon.

---

<div align="center">

**Built with care for students who learn by seeing.**

</div>
