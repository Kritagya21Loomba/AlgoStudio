import { motion } from 'framer-motion';
import type { KMPState } from '../../algorithms/string/types';

interface KMPChartProps {
  state: KMPState;
}

const CELL = 32;
const GAP = 2;
const PAD = 24;
const FONT = 13;

const spring = { type: 'spring' as const, stiffness: 300, damping: 25 };

function charFill(
  idx: number,
  comparedIdx: number | null,
  matches: number[],
  patternOffset: number,
  patternLen: number,
  isText: boolean,
  action: string | null,
): string {
  // Matched region in text
  if (isText) {
    for (const m of matches) {
      if (idx >= m && idx < m + patternLen) return 'var(--color-success)';
    }
  }
  if (idx === comparedIdx) {
    if (action === 'match') return 'var(--color-accent)';
    if (action === 'mismatch') return 'var(--color-error, #e74c3c)';
    return 'var(--color-highlight)';
  }
  return 'var(--color-surface)';
}

function charTextColor(
  idx: number,
  comparedIdx: number | null,
  matches: number[],
  patternOffset: number,
  patternLen: number,
  isText: boolean,
): string {
  if (isText) {
    for (const m of matches) {
      if (idx >= m && idx < m + patternLen) return '#fff';
    }
  }
  if (idx === comparedIdx) return '#fff';
  return 'var(--color-text)';
}

export function KMPChart({ state }: KMPChartProps) {
  const { text, pattern, lps, phase, comparedTextIdx, comparedPatIdx, patternOffset, matches, message } = state;

  const textLen = text.length;
  const patLen = pattern.length;
  const totalWidth = PAD * 2 + textLen * (CELL + GAP);
  const totalHeight = PAD + (phase === 'search' ? 4 : 3) * (CELL + 12) + 60;

  // Detect action from message for coloring
  const action = message.includes('match') && !message.includes('mismatch') ? 'match'
    : message.includes('mismatch') || message.includes('\u2260') ? 'mismatch'
    : null;

  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Phase label */}
      <text
        x={PAD}
        y={18}
        fill="var(--color-text-muted)"
        fontSize={11}
        fontFamily="var(--font-mono)"
        fontWeight={600}
      >
        {phase === 'lps' ? 'Phase 1: Building LPS Table' : 'Phase 2: Searching'}
      </text>

      {/* Text row */}
      <text
        x={PAD}
        y={42}
        fill="var(--color-text-muted)"
        fontSize={10}
        fontFamily="var(--font-mono)"
      >
        Text:
      </text>
      {text.split('').map((ch, i) => {
        const x = PAD + i * (CELL + GAP);
        const y = 48;
        return (
          <motion.g key={`text-${i}`}>
            <motion.rect
              x={x}
              y={y}
              width={CELL}
              height={CELL}
              rx={4}
              animate={{
                fill: phase === 'search'
                  ? charFill(i, comparedTextIdx, matches, patternOffset, patLen, true, action)
                  : 'var(--color-surface)',
                stroke: phase === 'search' && i === comparedTextIdx
                  ? 'var(--color-accent)'
                  : 'var(--color-border)',
              }}
              strokeWidth={1.5}
              transition={spring}
            />
            <text
              x={x + CELL / 2}
              y={y + CELL / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fill={phase === 'search'
                ? charTextColor(i, comparedTextIdx, matches, patternOffset, patLen, true)
                : 'var(--color-text)'}
              fontSize={FONT}
              fontFamily="var(--font-mono)"
              fontWeight={600}
            >
              {ch}
            </text>
            {/* Index labels */}
            <text
              x={x + CELL / 2}
              y={y + CELL + 12}
              textAnchor="middle"
              fill="var(--color-text-muted)"
              fontSize={8}
              fontFamily="var(--font-mono)"
            >
              {i}
            </text>
          </motion.g>
        );
      })}

      {/* Pattern row (aligned at patternOffset during search, centered during LPS) */}
      {(() => {
        const rowY = 48 + CELL + 24;
        const offsetX = phase === 'search' ? patternOffset : 0;

        return (
          <>
            <text
              x={PAD}
              y={rowY - 4}
              fill="var(--color-text-muted)"
              fontSize={10}
              fontFamily="var(--font-mono)"
            >
              Pattern:
            </text>
            {pattern.split('').map((ch, i) => {
              const x = PAD + (offsetX + i) * (CELL + GAP);
              return (
                <motion.g key={`pat-${i}`}>
                  <motion.rect
                    x={x}
                    y={rowY}
                    width={CELL}
                    height={CELL}
                    rx={4}
                    animate={{
                      fill: charFill(i, comparedPatIdx, [], 0, 0, false, action),
                      stroke: i === comparedPatIdx ? 'var(--color-accent)' : 'var(--color-border)',
                    }}
                    strokeWidth={1.5}
                    transition={spring}
                  />
                  <text
                    x={x + CELL / 2}
                    y={rowY + CELL / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={charTextColor(i, comparedPatIdx, [], 0, 0, false)}
                    fontSize={FONT}
                    fontFamily="var(--font-mono)"
                    fontWeight={600}
                  >
                    {ch}
                  </text>
                </motion.g>
              );
            })}
          </>
        );
      })()}

      {/* LPS table row */}
      {(() => {
        const rowY = 48 + 2 * (CELL + 24);
        if (lps.length === 0) return null;

        return (
          <>
            <text
              x={PAD}
              y={rowY - 4}
              fill="var(--color-text-muted)"
              fontSize={10}
              fontFamily="var(--font-mono)"
            >
              LPS:
            </text>
            {lps.map((val, i) => {
              const x = PAD + i * (CELL + GAP);
              const isBuilding = phase === 'lps' && i === state.lpsBuilding;
              return (
                <motion.g key={`lps-${i}`}>
                  <motion.rect
                    x={x}
                    y={rowY}
                    width={CELL}
                    height={CELL}
                    rx={4}
                    animate={{
                      fill: isBuilding ? 'var(--color-highlight)' : 'var(--color-surface-alt, rgba(0,0,0,0.1))',
                      stroke: isBuilding ? 'var(--color-highlight)' : 'var(--color-border)',
                    }}
                    strokeWidth={1.5}
                    transition={spring}
                  />
                  <text
                    x={x + CELL / 2}
                    y={rowY + CELL / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={isBuilding ? 'var(--color-text)' : 'var(--color-text-muted)'}
                    fontSize={FONT}
                    fontFamily="var(--font-mono)"
                    fontWeight={600}
                  >
                    {val}
                  </text>
                </motion.g>
              );
            })}
          </>
        );
      })()}

      {/* Message bar */}
      <text
        x={totalWidth / 2}
        y={totalHeight - 10}
        textAnchor="middle"
        fill="var(--color-accent-secondary)"
        fontSize={12}
        fontFamily="var(--font-mono)"
        fontWeight={500}
      >
        {message}
      </text>
    </svg>
  );
}
