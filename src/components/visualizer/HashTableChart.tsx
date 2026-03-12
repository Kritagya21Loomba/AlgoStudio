import { motion } from 'framer-motion';
import type { HashTableState } from '../../algorithms/hashing/types';

interface HashTableChartProps {
  state: HashTableState;
}

const BUCKET_WIDTH = 56;
const BUCKET_HEIGHT = 48;
const GAP = 4;
const PAD = 16;
const TOP_PAD = 40; // Space for hash formula

export function HashTableChart({ state }: HashTableChartProps) {
  const { buckets, hashFormula, probeSequence } = state;
  const cols = Math.min(buckets.length, Math.max(7, Math.ceil(Math.sqrt(buckets.length * 2))));
  const rows = Math.ceil(buckets.length / cols);

  const width = PAD * 2 + cols * (BUCKET_WIDTH + GAP) - GAP;
  const height = TOP_PAD + PAD + rows * (BUCKET_HEIGHT + GAP) - GAP + PAD;

  function getColor(status: string): string {
    switch (status) {
      case 'occupied': return 'var(--color-accent-secondary)';
      case 'probing': return 'var(--color-highlight)';
      case 'collision': return 'var(--color-danger, #ef4444)';
      case 'just-inserted': return 'var(--color-success)';
      default: return 'var(--color-surface)';
    }
  }

  function getBorderColor(status: string): string {
    switch (status) {
      case 'occupied': return 'var(--color-accent-secondary)';
      case 'probing': return 'var(--color-highlight)';
      case 'collision': return 'var(--color-danger, #ef4444)';
      case 'just-inserted': return 'var(--color-success)';
      default: return 'var(--color-border)';
    }
  }

  function getOpacity(status: string): number {
    return status === 'empty' ? 0.4 : 1;
  }

  // Find probe order for labels
  const probeOrder = new Map<number, number>();
  probeSequence.forEach((idx, order) => {
    if (!probeOrder.has(idx)) probeOrder.set(idx, order);
  });

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        {/* Hash formula */}
        <text
          x={width / 2}
          y={20}
          textAnchor="middle"
          fill="var(--color-accent)"
          fontSize={12}
          fontFamily="var(--font-mono)"
          fontWeight={600}
        >
          {hashFormula}
        </text>

        {/* Buckets */}
        {buckets.map((bucket, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const x = PAD + col * (BUCKET_WIDTH + GAP);
          const y = TOP_PAD + PAD + row * (BUCKET_HEIGHT + GAP);
          const probeNum = probeOrder.get(i);

          return (
            <g key={i}>
              {/* Bucket background */}
              <motion.rect
                x={x}
                y={y}
                width={BUCKET_WIDTH}
                height={BUCKET_HEIGHT}
                rx={6}
                fill={getColor(bucket.status)}
                fillOpacity={bucket.status === 'empty' ? 0.15 : 0.25}
                stroke={getBorderColor(bucket.status)}
                strokeWidth={bucket.status === 'empty' ? 1 : 2}
                opacity={getOpacity(bucket.status)}
                animate={{
                  fillOpacity: bucket.status === 'empty' ? 0.15 : 0.25,
                  strokeWidth: bucket.status === 'empty' ? 1 : 2,
                  opacity: getOpacity(bucket.status),
                }}
                transition={{ duration: 0.3 }}
              />

              {/* Index label */}
              <text
                x={x + 4}
                y={y + 12}
                fill="var(--color-text-muted)"
                fontSize={9}
                fontFamily="var(--font-mono)"
              >
                [{i}]
              </text>

              {/* Key value */}
              {bucket.key !== null && (
                <motion.text
                  x={x + BUCKET_WIDTH / 2}
                  y={y + BUCKET_HEIGHT / 2 + 5}
                  textAnchor="middle"
                  fill="var(--color-text)"
                  fontSize={14}
                  fontFamily="var(--font-mono)"
                  fontWeight={700}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {bucket.key}
                </motion.text>
              )}

              {/* Probe order badge */}
              {probeNum !== undefined && bucket.status !== 'empty' && bucket.status !== 'occupied' && (
                <motion.g
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: probeNum * 0.05 }}
                >
                  <circle
                    cx={x + BUCKET_WIDTH - 4}
                    cy={y + 4}
                    r={8}
                    fill="var(--color-accent)"
                  />
                  <text
                    x={x + BUCKET_WIDTH - 4}
                    y={y + 8}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={9}
                    fontFamily="var(--font-mono)"
                    fontWeight={700}
                  >
                    {probeNum + 1}
                  </text>
                </motion.g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Message */}
      {state.message && (
        <div className="mt-2 text-xs font-mono text-[var(--color-text-muted)] text-center">
          {state.message}
        </div>
      )}
    </div>
  );
}
