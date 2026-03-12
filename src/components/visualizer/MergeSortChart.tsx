import { motion } from 'framer-motion';
import type { SortingBarState } from '../../algorithms/sorting/types';

interface MergeSortChartProps {
  state: SortingBarState;
}

const WIDTH = 800;
const BASE_HEIGHT = 500;
const FONT_SIZE = 12;
const TOP_PAD = 24;
const MIN_CELL = 22;
const MAX_CELL = 36;

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 };

export function MergeSortChart({ state }: MergeSortChartProps) {
  const { splitLevels, activeRange, activeIndex } = state;
  const levels = splitLevels || [];
  if (levels.length === 0) return null;

  // Find the widest level to determine adaptive sizing
  const maxSubarraysInLevel = Math.max(...levels.map((l) => l.subarrays.length));
  const maxCellsInLevel = Math.max(
    ...levels.map((l) => l.subarrays.reduce((s, sub) => s + sub.values.length, 0)),
  );

  // Adaptive gap: more subarrays = still generous spacing
  const subarrayGap = Math.max(36, Math.min(60, (WIDTH - 80) / (maxSubarraysInLevel + 1) * 0.4));

  // Adaptive cell size: fit all cells + gaps within the width
  const cellGap = 2;
  const totalGapSpace = (maxSubarraysInLevel - 1) * subarrayGap + 80;
  const spaceForCells = WIDTH - totalGapSpace;
  const rawCellSize = spaceForCells / (maxCellsInLevel + maxCellsInLevel * (cellGap / MAX_CELL));
  const cellSize = Math.max(MIN_CELL, Math.min(MAX_CELL, Math.floor(rawCellSize)));

  const levelGap = cellSize + 28;
  const totalH = TOP_PAD + levels.length * levelGap + 30;
  const viewH = Math.max(BASE_HEIGHT, totalH);

  function getSubarrayWidth(count: number): number {
    return count * (cellSize + cellGap) - cellGap;
  }

  // Precompute positions for every level so connecting lines work correctly
  type SubPos = { x: number; w: number; left: number; right: number };
  const levelPositions: SubPos[][] = levels.map((level) => {
    const totalWidth = level.subarrays.reduce(
      (sum, sub) => sum + getSubarrayWidth(sub.values.length),
      0,
    ) + (level.subarrays.length - 1) * subarrayGap;

    const startX = (WIDTH - totalWidth) / 2;
    let cx = startX;
    return level.subarrays.map((sub) => {
      const subW = getSubarrayWidth(sub.values.length);
      const pos = { x: cx, w: subW, left: sub.left, right: sub.right };
      cx += subW + subarrayGap;
      return pos;
    });
  });

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${viewH}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {levels.map((level, levelIdx) => {
        const y = TOP_PAD + levelIdx * levelGap;
        const positions = levelPositions[levelIdx];

        return (
          <motion.g
            key={`level-${levelIdx}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: levelIdx * 0.04 }}
          >
            {/* Level label */}
            <text
              x={6}
              y={y + cellSize / 2 + 4}
              fill="var(--color-text-muted)"
              fontSize={7}
              fontFamily="var(--font-mono)"
              opacity={0.4}
            >
              {level.label === 'merge' ? 'merge' : levelIdx === 0 ? 'start' : `depth ${levelIdx}`}
            </text>

            {level.subarrays.map((sub, subIdx) => {
              const pos = positions[subIdx];
              const subX = pos.x;
              const subW = pos.w;

              const isActive = sub.active ||
                (activeRange && sub.left === activeRange[0] && sub.right === activeRange[1]);
              const isMerging = sub.merging;

              return (
                <motion.g key={`sub-${levelIdx}-${subIdx}`}>
                  {/* Subarray background pill */}
                  <motion.rect
                    animate={{ x: subX - 4, width: subW + 8 }}
                    y={y - 3}
                    height={cellSize + 6}
                    rx={5}
                    fill={
                      isMerging
                        ? 'var(--color-success)'
                        : isActive
                          ? 'var(--color-accent-secondary)'
                          : 'var(--color-surface)'
                    }
                    opacity={isMerging ? 0.1 : isActive ? 0.15 : 0.05}
                    stroke={
                      isMerging
                        ? 'var(--color-success)'
                        : isActive
                          ? 'var(--color-accent-secondary)'
                          : 'var(--color-border)'
                    }
                    strokeWidth={isMerging || isActive ? 1.5 : 0.5}
                    transition={spring}
                  />

                  {/* Cells */}
                  {sub.values.map((value, cellIdx) => {
                    const cx = subX + cellIdx * (cellSize + cellGap);
                    const globalIdx = sub.left + cellIdx;
                    const isCurrent = activeIndex === globalIdx &&
                      activeRange &&
                      globalIdx >= activeRange[0] &&
                      globalIdx <= activeRange[1];

                    return (
                      <motion.g key={`cell-${levelIdx}-${subIdx}-${cellIdx}`}>
                        <motion.rect
                          animate={{
                            x: cx,
                            fill: isCurrent
                              ? 'var(--color-highlight)'
                              : isMerging
                                ? 'var(--color-success)'
                                : 'var(--color-surface)',
                          }}
                          y={y}
                          width={cellSize}
                          height={cellSize}
                          rx={3}
                          stroke={isCurrent ? 'var(--color-highlight)' : 'var(--color-border)'}
                          strokeWidth={isCurrent ? 2 : 1}
                          transition={spring}
                        />
                        <motion.text
                          animate={{ x: cx + cellSize / 2 }}
                          y={y + cellSize / 2 + 1}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="var(--color-text)"
                          fontSize={Math.min(FONT_SIZE, cellSize * 0.45)}
                          fontWeight={600}
                          fontFamily="var(--font-mono)"
                          transition={spring}
                        >
                          {value}
                        </motion.text>
                      </motion.g>
                    );
                  })}

                  {/* Range label below (only for multi-element subarrays) */}
                  {sub.values.length > 1 && (
                    <text
                      x={subX + subW / 2}
                      y={y + cellSize + 12}
                      textAnchor="middle"
                      fill="var(--color-text-muted)"
                      fontSize={7}
                      fontFamily="var(--font-mono)"
                      opacity={0.4}
                    >
                      [{sub.left}..{sub.right}]
                    </text>
                  )}
                </motion.g>
              );
            })}

            {/* Connecting lines to next level */}
            {levelIdx < levels.length - 1 && level.label === 'split' && (() => {
              const nextPositions = levelPositions[levelIdx + 1];
              const nextLevel = levels[levelIdx + 1];
              const lines: JSX.Element[] = [];

              for (let si = 0; si < level.subarrays.length; si++) {
                const parentSub = level.subarrays[si];
                const parentPos = positions[si];
                const parentMidX = parentPos.x + parentPos.w / 2;

                for (let ni = 0; ni < nextLevel.subarrays.length; ni++) {
                  const childSub = nextLevel.subarrays[ni];
                  if (childSub.left >= parentSub.left && childSub.right <= parentSub.right) {
                    const childPos = nextPositions[ni];
                    const childMidX = childPos.x + childPos.w / 2;
                    lines.push(
                      <line
                        key={`line-${levelIdx}-${si}-${childSub.left}`}
                        x1={parentMidX}
                        y1={y + cellSize + 3}
                        x2={childMidX}
                        y2={y + levelGap - 3}
                        stroke="var(--color-border)"
                        strokeWidth={1}
                        strokeDasharray="3 3"
                        opacity={0.35}
                      />,
                    );
                  }
                }
              }

              return lines;
            })()}
          </motion.g>
        );
      })}
    </svg>
  );
}
