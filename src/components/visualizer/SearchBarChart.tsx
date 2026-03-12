import { motion, AnimatePresence } from 'framer-motion';
import type { SearchBarState } from '../../algorithms/searching/types';

interface SearchBarChartProps {
  state: SearchBarState;
}

const WIDTH = 800;
const HEIGHT = 400;
const PADDING_BOTTOM = 50;
const PADDING_TOP = 44;

const spring = { type: 'spring' as const, stiffness: 300, damping: 25 };
const springFast = { type: 'spring' as const, stiffness: 400, damping: 30 };

export function SearchBarChart({ state }: SearchBarChartProps) {
  const { values, ids, left, right, mid, target, found, eliminated } = state;
  const maxVal = Math.max(...values, target, 1);
  const n = values.length;

  const GAP = Math.max(2, Math.min(4, 120 / n));
  const barWidth = (WIDTH - (n - 1) * GAP) / n;
  const chartHeight = HEIGHT - PADDING_BOTTOM - PADDING_TOP;
  const showLabels = barWidth > 14;
  const fontSize = Math.min(12, barWidth * 0.6);
  const smallFontSize = Math.min(9, barWidth * 0.45);

  const targetY = HEIGHT - PADDING_BOTTOM - (target / maxVal) * chartHeight;

  function getBarX(i: number): number {
    return i * (barWidth + GAP);
  }
  function getBarCenter(i: number): number {
    return getBarX(i) + barWidth / 2;
  }
  function getBarHeight(value: number): number {
    return (value / maxVal) * (chartHeight - 10);
  }
  function getBarY(value: number): number {
    return HEIGHT - PADDING_BOTTOM - getBarHeight(value);
  }

  function getBarColor(index: number): string {
    if (found && index === mid) return 'var(--color-success)';
    if (mid !== null && index === mid) return 'var(--color-highlight)';
    if (eliminated.includes(index)) return 'var(--color-text-muted)';
    if (index >= left && index <= right) return 'var(--color-accent-secondary)';
    return 'var(--color-text-muted)';
  }

  function getBarOpacity(index: number): number {
    if (found && index === mid) return 1;
    if (mid !== null && index === mid) return 1;
    if (eliminated.includes(index)) return 0.2;
    if (index >= left && index <= right) return 0.85;
    return 0.2;
  }

  const midValue = mid !== null ? values[mid] : null;
  const comparisonSymbol =
    midValue !== null
      ? midValue === target ? '=' : midValue < target ? '<' : '>'
      : null;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="search-found-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <pattern
          id="eliminated-hatch"
          width="6"
          height="6"
          patternTransform="rotate(45)"
          patternUnits="userSpaceOnUse"
        >
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--color-text-muted)" strokeWidth="0.5" opacity="0.15" />
        </pattern>
      </defs>

      {/* Active search range background */}
      {left <= right && (
        <motion.rect
          animate={{
            x: getBarX(left) - GAP / 2,
            width: (right - left + 1) * (barWidth + GAP),
          }}
          y={PADDING_TOP}
          height={chartHeight}
          fill="var(--color-accent-secondary)"
          opacity={0.08}
          rx={4}
          transition={springFast}
        />
      )}

      {/* Eliminated region overlays with hatch */}
      {eliminated.length > 0 && (
        <>
          {left > 0 && (
            <rect
              x={0}
              y={PADDING_TOP}
              width={Math.max(0, getBarX(left) - GAP / 2)}
              height={chartHeight}
              fill="url(#eliminated-hatch)"
            />
          )}
          {right < n - 1 && (
            <rect
              x={getBarX(right) + barWidth + GAP / 2}
              y={PADDING_TOP}
              width={Math.max(0, WIDTH - getBarX(right) - barWidth - GAP / 2)}
              height={chartHeight}
              fill="url(#eliminated-hatch)"
            />
          )}
        </>
      )}

      {/* Target value dashed line */}
      <motion.line
        animate={{ y1: targetY, y2: targetY }}
        x1={0}
        x2={WIDTH}
        stroke="var(--color-accent)"
        strokeWidth={1.5}
        strokeDasharray="6 4"
        opacity={0.5}
        transition={spring}
      />
      <motion.g animate={{ y: targetY }} transition={spring}>
        <rect
          x={WIDTH - 94}
          y={-10}
          width={90}
          height={18}
          rx={3}
          fill="var(--color-accent)"
          opacity={0.15}
        />
        <text
          x={WIDTH - 49}
          y={3}
          textAnchor="middle"
          fill="var(--color-accent)"
          fontSize={10}
          fontFamily="var(--font-mono)"
          fontWeight="bold"
        >
          TARGET = {target}
        </text>
      </motion.g>

      {/* Comparison callout at mid */}
      <AnimatePresence>
        {mid !== null && !found && midValue !== null && comparisonSymbol && (
          <motion.g
            key={`comp-${mid}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <motion.rect
              animate={{ x: getBarCenter(mid) - 48 }}
              y={PADDING_TOP - 38}
              width={96}
              height={24}
              rx={4}
              fill="var(--color-highlight)"
              opacity={0.15}
              transition={spring}
            />
            <motion.rect
              animate={{ x: getBarCenter(mid) - 48 }}
              y={PADDING_TOP - 38}
              width={96}
              height={24}
              rx={4}
              fill="none"
              stroke="var(--color-highlight)"
              strokeWidth={1}
              opacity={0.5}
              transition={spring}
            />
            <motion.text
              animate={{ x: getBarCenter(mid) }}
              y={PADDING_TOP - 22}
              textAnchor="middle"
              fill="var(--color-highlight)"
              fontSize={11}
              fontWeight="bold"
              fontFamily="var(--font-mono)"
              transition={spring}
            >
              {midValue} {comparisonSymbol} {target}
            </motion.text>
          </motion.g>
        )}
      </AnimatePresence>

      {/* Found celebration */}
      <AnimatePresence>
        {found && mid !== null && (
          <motion.g
            key="found-celebration"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.rect
              animate={{ x: getBarCenter(mid) - 36 }}
              y={PADDING_TOP - 38}
              width={72}
              height={22}
              rx={4}
              fill="var(--color-success)"
              opacity={0.2}
              transition={spring}
            />
            <motion.text
              animate={{ x: getBarCenter(mid) }}
              y={PADDING_TOP - 23}
              textAnchor="middle"
              fill="var(--color-success)"
              fontSize={12}
              fontWeight="bold"
              fontFamily="var(--font-mono)"
              letterSpacing={1.5}
              transition={spring}
            >
              FOUND!
            </motion.text>
            <motion.text
              animate={{ x: getBarCenter(mid) }}
              y={PADDING_TOP - 8}
              textAnchor="middle"
              fill="var(--color-success)"
              fontSize={12}
              transition={spring}
            >
              &#x25BC;
            </motion.text>
          </motion.g>
        )}
      </AnimatePresence>

      {/* Bars + value/index labels */}
      {values.map((value, index) => {
        const bh = getBarHeight(value);
        const x = getBarX(index);
        const y = getBarY(value);
        const isFound = found && index === mid;

        return (
          <motion.g key={ids[index]}>
            <motion.rect
              animate={{
                x,
                y,
                height: bh,
                fill: getBarColor(index),
                opacity: getBarOpacity(index),
              }}
              transition={spring}
              width={barWidth}
              rx={Math.min(3, barWidth / 4)}
              filter={isFound ? 'url(#search-found-glow)' : undefined}
            />
            {isFound && (
              <motion.rect
                animate={{ x: x - 1, y: y - 1, height: bh + 2 }}
                width={barWidth + 2}
                rx={Math.min(4, barWidth / 4 + 1)}
                fill="none"
                stroke="var(--color-success)"
                strokeWidth={2.5}
                opacity={0.6}
                transition={spring}
              />
            )}
            {showLabels && (
              <motion.text
                animate={{ x: x + barWidth / 2, y: HEIGHT - PADDING_BOTTOM + 14 }}
                transition={spring}
                textAnchor="middle"
                fill="var(--color-text-muted)"
                fontSize={fontSize}
                fontFamily="var(--font-mono)"
                opacity={eliminated.includes(index) ? 0.3 : 1}
              >
                {value}
              </motion.text>
            )}
            {showLabels && (
              <motion.text
                animate={{ x: x + barWidth / 2, y: HEIGHT - PADDING_BOTTOM + 28 }}
                transition={spring}
                textAnchor="middle"
                fill="var(--color-text-muted)"
                fontSize={smallFontSize}
                fontFamily="var(--font-mono)"
                opacity={eliminated.includes(index) ? 0.2 : 0.5}
              >
                [{index}]
              </motion.text>
            )}
          </motion.g>
        );
      })}

      {/* Left bound marker */}
      {left <= right && (
        <motion.g animate={{ x: getBarCenter(left) }} transition={springFast}>
          <rect
            x={-14}
            y={HEIGHT - PADDING_BOTTOM + 33}
            width={28}
            height={16}
            rx={3}
            fill="var(--color-accent-secondary)"
            opacity={0.2}
          />
          <polygon
            points={`0,${HEIGHT - PADDING_BOTTOM + 30} -4,${HEIGHT - PADDING_BOTTOM + 33} 4,${HEIGHT - PADDING_BOTTOM + 33}`}
            fill="var(--color-accent-secondary)"
          />
          <text
            y={HEIGHT - PADDING_BOTTOM + 45}
            textAnchor="middle"
            fill="var(--color-accent-secondary)"
            fontSize={10}
            fontFamily="var(--font-mono)"
            fontWeight="bold"
          >
            L={left}
          </text>
        </motion.g>
      )}

      {/* Right bound marker */}
      {left <= right && (
        <motion.g animate={{ x: getBarCenter(right) }} transition={springFast}>
          <rect
            x={-14}
            y={HEIGHT - PADDING_BOTTOM + 33}
            width={28}
            height={16}
            rx={3}
            fill="var(--color-accent)"
            opacity={0.2}
          />
          <polygon
            points={`0,${HEIGHT - PADDING_BOTTOM + 30} -4,${HEIGHT - PADDING_BOTTOM + 33} 4,${HEIGHT - PADDING_BOTTOM + 33}`}
            fill="var(--color-accent)"
          />
          <text
            y={HEIGHT - PADDING_BOTTOM + 45}
            textAnchor="middle"
            fill="var(--color-accent)"
            fontSize={10}
            fontFamily="var(--font-mono)"
            fontWeight="bold"
          >
            R={right}
          </text>
        </motion.g>
      )}

      {/* Mid marker */}
      <AnimatePresence>
        {mid !== null && (
          <motion.g
            key={`mid-${mid}`}
            animate={{ x: getBarCenter(mid) }}
            initial={{ opacity: 0, y: -4 }}
            exit={{ opacity: 0, y: -4 }}
            transition={springFast}
          >
            <motion.rect
              x={-16}
              y={PADDING_TOP - 2}
              width={32}
              height={14}
              rx={3}
              fill={found ? 'var(--color-success)' : 'var(--color-highlight)'}
              animate={{ opacity: [0.2, 0.35, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <polygon
              points={`0,${PADDING_TOP + 12} -4,${PADDING_TOP + 8} 4,${PADDING_TOP + 8}`}
              fill={found ? 'var(--color-success)' : 'var(--color-highlight)'}
            />
            <text
              y={PADDING_TOP + 9}
              textAnchor="middle"
              fill={found ? 'var(--color-success)' : 'var(--color-highlight)'}
              fontSize={9}
              fontFamily="var(--font-mono)"
              fontWeight="bold"
            >
              M={mid}
            </text>
          </motion.g>
        )}
      </AnimatePresence>

      {/* Search range info */}
      {left <= right && !found && (
        <motion.text
          animate={{ x: (getBarCenter(left) + getBarCenter(right)) / 2 }}
          y={PADDING_TOP + 14}
          textAnchor="middle"
          fill="var(--color-text-muted)"
          fontSize={9}
          fontFamily="var(--font-mono)"
          opacity={0.6}
          transition={spring}
        >
          Search range [{left}..{right}] ({right - left + 1} element{right - left !== 0 ? 's' : ''})
        </motion.text>
      )}
    </svg>
  );
}
