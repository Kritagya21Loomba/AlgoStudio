import { motion } from 'framer-motion';
import type { SortingBarState } from '../../algorithms/sorting/types';

interface BarChartProps {
  state: SortingBarState;
  instanceId?: string;
}

const WIDTH = 800;
const HEIGHT = 400;
const PADDING_TOP = 40;
const PADDING_BOTTOM = 44;

const spring = { type: 'spring' as const, stiffness: 300, damping: 25 };
const springFast = { type: 'spring' as const, stiffness: 400, damping: 30 };

export function BarChart({ state, instanceId = '' }: BarChartProps) {
  const { values, ids, comparing, swapping, sorted, pivot, shifting, activeRange, minIndex, keyValue, insertTarget, sortedRange } =
    state;
  const maxVal = Math.max(...values, 1);
  const n = values.length;

  const GAP = Math.max(2, Math.min(4, 120 / n));
  const barWidth = (WIDTH - (n - 1) * GAP) / n;
  const fontSize = Math.min(12, barWidth * 0.6);
  const smallFontSize = Math.min(9, barWidth * 0.45);
  const showLabels = barWidth > 14;

  // Namespace SVG def IDs to avoid collisions when multiple BarCharts are in the DOM
  const sid = instanceId ? `${instanceId}-` : '';
  const ID_SWAP_GLOW = `${sid}swap-glow`;
  const ID_ARR_R = `${sid}arr-r`;
  const ID_ARR_L = `${sid}arr-l`;
  const ID_ARR_SHIFT = `${sid}arr-shift`;

  /* ---- helpers ---- */

  function getBarX(i: number): number {
    return i * (barWidth + GAP);
  }

  function getBarCenter(i: number): number {
    return getBarX(i) + barWidth / 2;
  }

  function getBarHeight(value: number): number {
    return (value / maxVal) * (HEIGHT - PADDING_TOP - PADDING_BOTTOM - 10);
  }

  function getBarY(value: number): number {
    return HEIGHT - PADDING_BOTTOM - getBarHeight(value);
  }

  function getBarColor(index: number): string {
    if (swapping && (index === swapping[0] || index === swapping[1])) {
      return 'var(--color-accent)';
    }
    if (pivot != null && index === pivot) {
      return 'var(--color-success)';
    }
    if (minIndex != null && index === minIndex) {
      return 'var(--color-success)';
    }
    if (insertTarget != null && index === insertTarget) {
      return 'var(--color-success)';
    }
    if (comparing && (index === comparing[0] || index === comparing[1])) {
      return 'var(--color-highlight)';
    }
    if (shifting != null && index === shifting) {
      return 'var(--color-accent-secondary)';
    }
    if (sorted.includes(index)) {
      return 'var(--color-accent-secondary)';
    }
    return 'var(--color-text-muted)';
  }

  /* ---- derived layout data ---- */

  // Active-range background rect
  const rangeRect = activeRange
    ? {
        x: getBarX(activeRange[0]) - GAP / 2,
        width: (activeRange[1] - activeRange[0] + 1) * (barWidth + GAP),
      }
    : null;

  // Boundaries between sorted and unsorted regions
  const sortedDividers: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    if (sorted.includes(i) !== sorted.includes(i + 1)) {
      sortedDividers.push(i);
    }
  }

  // Comparison bracket positions (only when not also swapping)
  const comp =
    comparing && !swapping
      ? (() => {
          const [a, b] = comparing;
          const li = Math.min(a, b);
          const ri = Math.max(a, b);
          return {
            li,
            ri,
            lx: getBarCenter(li),
            rx: getBarCenter(ri),
            mx: (getBarCenter(li) + getBarCenter(ri)) / 2,
            y: PADDING_TOP - 8,
          };
        })()
      : null;

  // Swap arrow positions
  const swap = swapping
    ? (() => {
        const [a, b] = swapping;
        const li = Math.min(a, b);
        const ri = Math.max(a, b);
        return {
          li,
          ri,
          lx: getBarCenter(li),
          rx: getBarCenter(ri),
          mx: (getBarCenter(li) + getBarCenter(ri)) / 2,
          y: PADDING_TOP - 6,
        };
      })()
    : null;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* ====== defs: glow filter + arrow markers ====== */}
      <defs>
        <filter id={ID_SWAP_GLOW} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Right-pointing arrow (swap) */}
        <marker
          id={ID_ARR_R}
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L8,3 L0,6" fill="var(--color-accent)" />
        </marker>
        {/* Left-pointing arrow (swap) */}
        <marker
          id={ID_ARR_L}
          markerWidth="8"
          markerHeight="6"
          refX="1"
          refY="3"
          orient="auto"
        >
          <path d="M8,0 L0,3 L8,6" fill="var(--color-accent)" />
        </marker>
        {/* Arrow for shifting / KEY indicator */}
        <marker
          id={ID_ARR_SHIFT}
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L8,3 L0,6" fill="var(--color-accent-secondary)" />
        </marker>
      </defs>

      {/* ====== Layer 1: Active-range background ====== */}
      {rangeRect && (
        <motion.rect
          animate={{ x: rangeRect.x, width: rangeRect.width }}
          y={PADDING_TOP}
          height={HEIGHT - PADDING_TOP - PADDING_BOTTOM}
          fill="var(--color-accent)"
          opacity={0.06}
          rx={4}
          transition={springFast}
        />
      )}

      {/* ====== Layer 2: Active-range brackets + label ====== */}
      {activeRange && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {/* Left bracket [ */}
          <motion.path
            animate={{
              d: `M${getBarX(activeRange[0]) - GAP / 2 + 6},${PADDING_TOP + 2}
                  L${getBarX(activeRange[0]) - GAP / 2 + 1},${PADDING_TOP + 2}
                  L${getBarX(activeRange[0]) - GAP / 2 + 1},${PADDING_TOP + 14}
                  L${getBarX(activeRange[0]) - GAP / 2 + 6},${PADDING_TOP + 14}`,
            }}
            fill="none"
            stroke="var(--color-text-muted)"
            strokeWidth={1.5}
            opacity={0.7}
            transition={springFast}
          />
          {/* Right bracket ] */}
          <motion.path
            animate={{
              d: `M${getBarX(activeRange[1]) + barWidth + GAP / 2 - 6},${PADDING_TOP + 2}
                  L${getBarX(activeRange[1]) + barWidth + GAP / 2 - 1},${PADDING_TOP + 2}
                  L${getBarX(activeRange[1]) + barWidth + GAP / 2 - 1},${PADDING_TOP + 14}
                  L${getBarX(activeRange[1]) + barWidth + GAP / 2 - 6},${PADDING_TOP + 14}`,
            }}
            fill="none"
            stroke="var(--color-text-muted)"
            strokeWidth={1.5}
            opacity={0.7}
            transition={springFast}
          />
          {/* "Subarray [start..end]" label */}
          <motion.text
            animate={{
              x:
                (getBarX(activeRange[0]) +
                  getBarX(activeRange[1]) +
                  barWidth) /
                2,
            }}
            y={PADDING_TOP - 1}
            textAnchor="middle"
            fill="var(--color-text-muted)"
            fontSize={9}
            fontFamily="var(--font-mono)"
            opacity={0.8}
            transition={springFast}
          >
            Subarray [{activeRange[0]}..{activeRange[1]}]
          </motion.text>
        </motion.g>
      )}

      {/* ====== Layer 3: Sorted / unsorted dividers ====== */}
      {sortedDividers.map((i) => {
        const lx = getBarX(i) + barWidth + GAP / 2;
        return (
          <motion.line
            key={`div-${i}`}
            x1={lx}
            y1={PADDING_TOP}
            x2={lx}
            y2={HEIGHT - PADDING_BOTTOM}
            stroke="var(--color-border)"
            strokeWidth={1}
            strokeDasharray="4 3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 0.3 }}
          />
        );
      })}

      {/* ====== Layer 4: Comparison bracket ====== */}
      {comp && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          {/* Value label above left compared bar */}
          <motion.text
            animate={{ x: comp.lx }}
            y={comp.y - 14}
            textAnchor="middle"
            fill="var(--color-highlight)"
            fontSize={11}
            fontWeight="bold"
            fontFamily="var(--font-mono)"
            transition={spring}
          >
            {values[comp.li]}
          </motion.text>
          {/* Value label above right compared bar */}
          <motion.text
            animate={{ x: comp.rx }}
            y={comp.y - 14}
            textAnchor="middle"
            fill="var(--color-highlight)"
            fontSize={11}
            fontWeight="bold"
            fontFamily="var(--font-mono)"
            transition={spring}
          >
            {values[comp.ri]}
          </motion.text>
          {/* Horizontal bracket line */}
          <motion.line
            animate={{ x1: comp.lx, x2: comp.rx }}
            y1={comp.y}
            y2={comp.y}
            stroke="var(--color-highlight)"
            strokeWidth={1.5}
            transition={spring}
          />
          {/* Left tick down */}
          <motion.line
            animate={{ x1: comp.lx, x2: comp.lx }}
            y1={comp.y}
            y2={comp.y + 5}
            stroke="var(--color-highlight)"
            strokeWidth={1.5}
            transition={spring}
          />
          {/* Right tick down */}
          <motion.line
            animate={{ x1: comp.rx, x2: comp.rx }}
            y1={comp.y}
            y2={comp.y + 5}
            stroke="var(--color-highlight)"
            strokeWidth={1.5}
            transition={spring}
          />
          {/* "?" between the two values */}
          <motion.text
            animate={{ x: comp.mx }}
            y={comp.y - 3}
            textAnchor="middle"
            fill="var(--color-highlight)"
            fontSize={13}
            fontWeight="bold"
            fontFamily="var(--font-mono)"
            transition={spring}
          >
            ?
          </motion.text>
        </motion.g>
      )}

      {/* ====== Layer 5: Swap arrows ====== */}
      {swap && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          {/* "SWAP" label */}
          <motion.text
            animate={{ x: swap.mx }}
            y={swap.y - 16}
            textAnchor="middle"
            fill="var(--color-accent)"
            fontSize={10}
            fontWeight="bold"
            fontFamily="var(--font-mono)"
            letterSpacing={1}
            transition={spring}
          >
            SWAP
          </motion.text>
          {/* Top curved arrow: left -> right */}
          <motion.path
            animate={{
              d: `M${swap.lx + 4},${swap.y} Q${swap.mx},${swap.y - 12} ${swap.rx - 4},${swap.y}`,
            }}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={1.5}
            markerEnd={`url(#${ID_ARR_R})`}
            transition={spring}
          />
          {/* Bottom curved arrow: right -> left */}
          <motion.path
            animate={{
              d: `M${swap.rx - 4},${swap.y + 8} Q${swap.mx},${swap.y + 20} ${swap.lx + 4},${swap.y + 8}`,
            }}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={1.5}
            markerEnd={`url(#${ID_ARR_L})`}
            transition={spring}
          />
        </motion.g>
      )}

      {/* ====== Layer 6: Pivot indicator ====== */}
      {pivot != null && !swapping && (
        <motion.g
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* "PIVOT" text */}
          <motion.text
            animate={{ x: getBarCenter(pivot) }}
            y={getBarY(values[pivot]) - 18}
            textAnchor="middle"
            fill="var(--color-success)"
            fontSize={9}
            fontWeight="bold"
            fontFamily="var(--font-mono)"
            letterSpacing={0.5}
            transition={spring}
          >
            PIVOT
          </motion.text>
          {/* Downward arrow */}
          <motion.text
            animate={{ x: getBarCenter(pivot) }}
            y={getBarY(values[pivot]) - 7}
            textAnchor="middle"
            fill="var(--color-success)"
            fontSize={10}
            transition={spring}
          >
            {'\u25BC'}
          </motion.text>
        </motion.g>
      )}

      {/* ====== Layer 7: Shifting / KEY indicator ====== */}
      {shifting != null && (
        <motion.g
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* "KEY" text */}
          <motion.text
            animate={{ x: getBarCenter(shifting) }}
            y={getBarY(values[shifting]) - 18}
            textAnchor="middle"
            fill="var(--color-accent-secondary)"
            fontSize={9}
            fontWeight="bold"
            fontFamily="var(--font-mono)"
            letterSpacing={0.5}
            transition={spring}
          >
            KEY
          </motion.text>
          {/* Curved arrow showing insertion direction (leftward) */}
          <motion.path
            animate={{
              d: `M${getBarCenter(shifting) + 8},${getBarY(values[shifting]) - 8} Q${getBarCenter(shifting)},${getBarY(values[shifting]) - 22} ${getBarCenter(shifting) - 12},${getBarY(values[shifting]) - 8}`,
            }}
            fill="none"
            stroke="var(--color-accent-secondary)"
            strokeWidth={1.5}
            markerEnd={`url(#${ID_ARR_SHIFT})`}
            transition={spring}
          />
        </motion.g>
      )}

      {/* ====== Layer 8: MIN indicator for Selection Sort ====== */}
      {minIndex != null && !swapping && (
        <motion.g
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* "MIN" text */}
          <motion.text
            animate={{ x: getBarCenter(minIndex) }}
            y={getBarY(values[minIndex]) - 18}
            textAnchor="middle"
            fill="var(--color-success)"
            fontSize={9}
            fontWeight="bold"
            fontFamily="var(--font-mono)"
            letterSpacing={0.5}
            transition={spring}
          >
            MIN
          </motion.text>
          {/* Value label */}
          <motion.text
            animate={{ x: getBarCenter(minIndex) }}
            y={getBarY(values[minIndex]) - 7}
            textAnchor="middle"
            fill="var(--color-success)"
            fontSize={10}
            fontWeight="bold"
            fontFamily="var(--font-mono)"
            transition={spring}
          >
            {values[minIndex]}
          </motion.text>
          {/* Glow ring */}
          <motion.rect
            animate={{
              x: getBarX(minIndex) - 2,
              y: getBarY(values[minIndex]) - 2,
              height: getBarHeight(values[minIndex]) + 4,
            }}
            width={barWidth + 4}
            rx={Math.min(4, barWidth / 4 + 1)}
            fill="none"
            stroke="var(--color-success)"
            strokeWidth={2}
            opacity={0.5}
            transition={spring}
          />
        </motion.g>
      )}

      {/* ====== Layer 9: Sorted range bracket for Insertion Sort ====== */}
      {sortedRange && !swapping && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {/* Sorted region background */}
          <motion.rect
            animate={{
              x: getBarX(sortedRange[0]) - GAP / 2,
              width: (sortedRange[1] - sortedRange[0] + 1) * (barWidth + GAP),
            }}
            y={HEIGHT - PADDING_BOTTOM + 2}
            height={4}
            fill="var(--color-accent-secondary)"
            opacity={0.5}
            rx={2}
            transition={springFast}
          />
          {/* "SORTED" label */}
          <motion.text
            animate={{
              x: (getBarCenter(sortedRange[0]) + getBarCenter(sortedRange[1])) / 2,
            }}
            y={HEIGHT - PADDING_BOTTOM + 42}
            textAnchor="middle"
            fill="var(--color-accent-secondary)"
            fontSize={8}
            fontWeight="bold"
            fontFamily="var(--font-mono)"
            letterSpacing={1}
            opacity={0.7}
            transition={springFast}
          >
            SORTED [{sortedRange[0]}..{sortedRange[1]}]
          </motion.text>
        </motion.g>
      )}

      {/* ====== Layer 10: Key value floating label for Insertion Sort ====== */}
      {keyValue != null && shifting != null && (
        <motion.g
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Key value pill */}
          <motion.rect
            animate={{ x: getBarCenter(shifting) - 22 }}
            y={PADDING_TOP - 36}
            width={44}
            height={20}
            rx={10}
            fill="var(--color-accent-secondary)"
            opacity={0.15}
            transition={spring}
          />
          <motion.rect
            animate={{ x: getBarCenter(shifting) - 22 }}
            y={PADDING_TOP - 36}
            width={44}
            height={20}
            rx={10}
            fill="none"
            stroke="var(--color-accent-secondary)"
            strokeWidth={1.5}
            opacity={0.5}
            transition={spring}
          />
          <motion.text
            animate={{ x: getBarCenter(shifting) }}
            y={PADDING_TOP - 22}
            textAnchor="middle"
            fill="var(--color-accent-secondary)"
            fontSize={11}
            fontWeight="bold"
            fontFamily="var(--font-mono)"
            transition={spring}
          >
            {keyValue}
          </motion.text>
        </motion.g>
      )}

      {/* ====== Layer 11: Bars + value labels + index labels ====== */}
      {values.map((value, index) => {
        const bh = getBarHeight(value);
        const x = getBarX(index);
        const y = getBarY(value);
        const isSwap =
          swapping && (index === swapping[0] || index === swapping[1]);

        return (
          <motion.g key={ids[index]}>
            {/* Main bar rect */}
            <motion.rect
              animate={{ x, y, height: bh, fill: getBarColor(index) }}
              transition={spring}
              width={barWidth}
              rx={Math.min(3, barWidth / 4)}
              filter={isSwap ? `url(#${ID_SWAP_GLOW})` : undefined}
            />
            {/* Extra outline glow for swapping bars */}
            {isSwap && (
              <motion.rect
                animate={{ x: x - 1, y: y - 1, height: bh + 2 }}
                width={barWidth + 2}
                rx={Math.min(4, barWidth / 4 + 1)}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth={2}
                opacity={0.5}
                transition={spring}
              />
            )}
            {/* Value label */}
            {showLabels && (
              <motion.text
                animate={{
                  x: x + barWidth / 2,
                  y: HEIGHT - PADDING_BOTTOM + 14,
                }}
                transition={spring}
                textAnchor="middle"
                fill="var(--color-text-muted)"
                fontSize={fontSize}
                fontFamily="var(--font-mono)"
              >
                {value}
              </motion.text>
            )}
            {/* Index label */}
            {showLabels && (
              <motion.text
                animate={{
                  x: x + barWidth / 2,
                  y: HEIGHT - PADDING_BOTTOM + 28,
                }}
                transition={spring}
                textAnchor="middle"
                fill="var(--color-text-muted)"
                fontSize={smallFontSize}
                fontFamily="var(--font-mono)"
                opacity={0.5}
              >
                [{index}]
              </motion.text>
            )}
          </motion.g>
        );
      })}
    </svg>
  );
}
