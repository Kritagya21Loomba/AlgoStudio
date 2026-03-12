import { motion } from 'framer-motion';
import type { SortingBarState } from '../../algorithms/sorting/types';

interface HeapSortChartProps {
  state: SortingBarState;
}

const WIDTH = 800;
const HEIGHT = 480;
const TREE_HEIGHT = 240;
const ARRAY_TOP = 265;
const ARRAY_BOTTOM = 40;
const NODE_R = 18;

const spring = { type: 'spring' as const, stiffness: 300, damping: 25 };

export function HeapSortChart({ state }: HeapSortChartProps) {
  const { values, ids, comparing, swapping, sorted, activeIndex } = state;
  const n = values.length;
  const heapSize = n - sorted.length;

  // --- Array bar layout ---
  const GAP = Math.max(2, Math.min(4, 120 / n));
  const barWidth = (WIDTH - (n - 1) * GAP) / n;
  const maxVal = Math.max(...values, 1);
  const barAreaH = HEIGHT - ARRAY_TOP - ARRAY_BOTTOM;
  const showLabels = barWidth > 14;
  const fontSize = Math.min(11, barWidth * 0.55);

  function getBarX(i: number): number {
    return i * (barWidth + GAP);
  }
  function getBarCenter(i: number): number {
    return getBarX(i) + barWidth / 2;
  }
  function getBarH(v: number): number {
    return (v / maxVal) * (barAreaH - 8);
  }
  function getBarY(v: number): number {
    return HEIGHT - ARRAY_BOTTOM - getBarH(v);
  }

  // --- Tree layout ---
  // Only show tree nodes for indices in the heap (not sorted ones)
  const depth = heapSize > 0 ? Math.floor(Math.log2(heapSize)) : 0;
  const treeTopPad = 22;

  function getTreeNodePos(i: number): { x: number; y: number } | null {
    if (i >= heapSize) return null;
    const d = Math.floor(Math.log2(i + 1));
    const nodesAtDepth = Math.pow(2, d);
    const posInLevel = i - (nodesAtDepth - 1);
    const totalDepth = Math.max(depth, 1);
    const levelWidth = WIDTH - 80;
    const spacing = levelWidth / (nodesAtDepth + 1);
    return {
      x: 40 + spacing * (posInLevel + 1),
      y: treeTopPad + (d / totalDepth) * (TREE_HEIGHT - treeTopPad - NODE_R - 10),
    };
  }

  function getNodeColor(i: number): string {
    if (swapping && (i === swapping[0] || i === swapping[1])) return 'var(--color-accent)';
    if (comparing && (i === comparing[0] || i === comparing[1])) return 'var(--color-highlight)';
    if (i === activeIndex) return 'var(--color-accent-secondary)';
    return 'var(--color-surface)';
  }

  function getNodeStroke(i: number): string {
    if (swapping && (i === swapping[0] || i === swapping[1])) return 'var(--color-accent)';
    if (comparing && (i === comparing[0] || i === comparing[1])) return 'var(--color-highlight)';
    if (i === activeIndex) return 'var(--color-accent-secondary)';
    return 'var(--color-border)';
  }

  function getNodeTextColor(i: number): string {
    if (swapping && (i === swapping[0] || i === swapping[1])) return '#fff';
    if (comparing && (i === comparing[0] || i === comparing[1])) return 'var(--color-text)';
    if (i === activeIndex) return '#fff';
    return 'var(--color-text)';
  }

  function getBarColor(i: number): string {
    if (sorted.includes(i)) return 'var(--color-success)';
    if (swapping && (i === swapping[0] || i === swapping[1])) return 'var(--color-accent)';
    if (comparing && (i === comparing[0] || i === comparing[1])) return 'var(--color-highlight)';
    if (i === activeIndex) return 'var(--color-accent-secondary)';
    return 'var(--color-text-muted)';
  }

  // Build parent-child edges for heap portion
  const treeEdges: { parent: number; child: number }[] = [];
  for (let i = 0; i < heapSize; i++) {
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < heapSize) treeEdges.push({ parent: i, child: left });
    if (right < heapSize) treeEdges.push({ parent: i, child: right });
  }

  return (
    <div className="w-full h-full relative">
      {/* Heap size badge — HTML overlay for maximum visibility */}
      {heapSize > 0 && (
        <div
          className="absolute top-2 left-2 z-10 px-3 py-1 rounded-md font-mono text-sm font-bold"
          style={{
            background: 'var(--color-accent)',
            color: '#fff',
            letterSpacing: '0.5px',
          }}
        >
          HEAP SIZE: {heapSize}
        </div>
      )}
      {heapSize === 0 && (
        <div
          className="absolute top-2 left-2 z-10 px-3 py-1 rounded-md font-mono text-sm font-bold"
          style={{
            background: 'var(--color-success)',
            color: '#fff',
            letterSpacing: '0.5px',
          }}
        >
          SORTED
        </div>
      )}
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="heap-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* === TREE SECTION === */}

      {/* Tree edges */}
      {treeEdges.map(({ parent, child }) => {
        const pPos = getTreeNodePos(parent);
        const cPos = getTreeNodePos(child);
        if (!pPos || !cPos) return null;
        const isActive =
          (comparing && ((comparing[0] === parent && comparing[1] === child) ||
            (comparing[1] === parent && comparing[0] === child))) ||
          (swapping && ((swapping[0] === parent && swapping[1] === child) ||
            (swapping[1] === parent && swapping[0] === child)));
        return (
          <motion.line
            key={`edge-${parent}-${child}`}
            x1={pPos.x}
            y1={pPos.y}
            x2={cPos.x}
            y2={cPos.y}
            stroke={isActive ? 'var(--color-highlight)' : 'var(--color-border)'}
            strokeWidth={isActive ? 2 : 1}
            opacity={isActive ? 0.7 : 0.3}
          />
        );
      })}

      {/* Tree nodes */}
      {Array.from({ length: heapSize }, (_, i) => {
        const pos = getTreeNodePos(i);
        if (!pos) return null;
        const isSwap = swapping && (i === swapping[0] || i === swapping[1]);
        return (
          <motion.g key={`tree-node-${ids[i]}`}>
            <motion.circle
              animate={{
                cx: pos.x,
                cy: pos.y,
                fill: getNodeColor(i),
                stroke: getNodeStroke(i),
              }}
              r={NODE_R}
              strokeWidth={isSwap ? 2.5 : 1.5}
              transition={spring}
              filter={isSwap ? 'url(#heap-glow)' : undefined}
            />
            <motion.text
              animate={{ x: pos.x, y: pos.y }}
              textAnchor="middle"
              dominantBaseline="central"
              fill={getNodeTextColor(i)}
              fontSize={11}
              fontWeight={600}
              fontFamily="var(--font-mono)"
              transition={spring}
              style={{ pointerEvents: 'none' }}
            >
              {values[i]}
            </motion.text>
            {/* Index label below node */}
            <motion.text
              animate={{ x: pos.x, y: pos.y + NODE_R + 10 }}
              textAnchor="middle"
              fill="var(--color-text-muted)"
              fontSize={7}
              fontFamily="var(--font-mono)"
              opacity={0.5}
              transition={spring}
            >
              [{i}]
            </motion.text>
            {/* Root = MAX label */}
            {i === 0 && !swapping && (
              <motion.text
                animate={{ x: pos.x, y: pos.y - NODE_R - 6 }}
                textAnchor="middle"
                fill="var(--color-accent)"
                fontSize={8}
                fontWeight="bold"
                fontFamily="var(--font-mono)"
                transition={spring}
              >
                MAX
              </motion.text>
            )}
            {/* Parent-child relationship labels */}
            {comparing && i === comparing[0] && i === activeIndex && (
              <motion.text
                animate={{ x: pos.x, y: pos.y - NODE_R - 6 }}
                textAnchor="middle"
                fill="var(--color-highlight)"
                fontSize={8}
                fontWeight="bold"
                fontFamily="var(--font-mono)"
              >
                PARENT
              </motion.text>
            )}
          </motion.g>
        );
      })}

      {/* Divider line between tree and array */}
      <line
        x1={20}
        y1={ARRAY_TOP - 14}
        x2={WIDTH - 20}
        y2={ARRAY_TOP - 14}
        stroke="var(--color-border)"
        strokeWidth={0.5}
        strokeDasharray="4 4"
        opacity={0.3}
      />
      <text
        x={WIDTH / 2}
        y={ARRAY_TOP - 4}
        textAnchor="middle"
        fill="var(--color-text-muted)"
        fontSize={8}
        fontFamily="var(--font-mono)"
        opacity={0.4}
      >
        ARRAY
      </text>

      {/* === ARRAY BAR SECTION === */}
      {values.map((value, index) => {
        const bh = getBarH(value);
        const x = getBarX(index);
        const y = getBarY(value);
        const isSorted = sorted.includes(index);
        const isSwap = swapping && (index === swapping[0] || index === swapping[1]);

        return (
          <motion.g key={ids[index]}>
            <motion.rect
              animate={{
                x,
                y,
                height: bh,
                fill: getBarColor(index),
                opacity: isSorted ? 0.5 : 1,
              }}
              transition={spring}
              width={barWidth}
              rx={Math.min(3, barWidth / 4)}
              filter={isSwap ? 'url(#heap-glow)' : undefined}
            />
            {showLabels && (
              <motion.text
                animate={{ x: x + barWidth / 2, y: HEIGHT - ARRAY_BOTTOM + 12 }}
                transition={spring}
                textAnchor="middle"
                fill="var(--color-text-muted)"
                fontSize={fontSize}
                fontFamily="var(--font-mono)"
                opacity={isSorted ? 0.4 : 0.8}
              >
                {value}
              </motion.text>
            )}
            {showLabels && (
              <motion.text
                animate={{ x: x + barWidth / 2, y: HEIGHT - ARRAY_BOTTOM + 24 }}
                transition={spring}
                textAnchor="middle"
                fill="var(--color-text-muted)"
                fontSize={Math.min(8, barWidth * 0.4)}
                fontFamily="var(--font-mono)"
                opacity={0.35}
              >
                [{index}]
              </motion.text>
            )}
            {/* "SORTED" marker on sorted bars */}
            {isSorted && index === sorted[sorted.length - 1] && sorted.length < n && (
              <motion.text
                initial={{ opacity: 0 }}
                animate={{ x: x + barWidth / 2, opacity: 1 }}
                y={y - 6}
                textAnchor="middle"
                fill="var(--color-success)"
                fontSize={7}
                fontWeight="bold"
                fontFamily="var(--font-mono)"
                letterSpacing={0.5}
              >
                SORTED
              </motion.text>
            )}
          </motion.g>
        );
      })}
    </svg>
    </div>
  );
}
