import { motion } from 'framer-motion';
import type { SegTreeState } from '../../algorithms/tree/seg-tree-types';

interface SegTreeChartProps {
  state: SegTreeState;
}

const WIDTH = 800;
const HEIGHT = 450;
const PAD_X = 30;
const PAD_Y = 30;
const NODE_RADIUS = 20;

const spring = { type: 'spring' as const, stiffness: 300, damping: 25 };

function scaleX(nx: number): number {
  return PAD_X + nx * (WIDTH - 2 * PAD_X);
}

function scaleY(ny: number): number {
  return PAD_Y + ny * (HEIGHT - 2 * PAD_Y);
}

export function SegTreeChart({ state }: SegTreeChartProps) {
  const { tree, baseArray, highlightedNodes, updatedNode, queryRange } = state;

  const nodeMap = new Map(tree.map((n) => [n.index, n]));

  function getNodeFill(idx: number): string {
    if (idx === updatedNode) return 'var(--color-warning, #e67e22)';
    if (highlightedNodes.includes(idx)) return 'var(--color-accent)';
    // Highlight leaf nodes that fall within query range
    const node = nodeMap.get(idx);
    if (queryRange && node && node.rangeL >= queryRange[0] && node.rangeR <= queryRange[1]) {
      return 'var(--color-accent-secondary)';
    }
    return 'var(--color-surface)';
  }

  function getNodeTextColor(idx: number): string {
    if (idx === updatedNode || highlightedNodes.includes(idx)) return '#fff';
    const node = nodeMap.get(idx);
    if (queryRange && node && node.rangeL >= queryRange[0] && node.rangeR <= queryRange[1]) {
      return '#fff';
    }
    return 'var(--color-text)';
  }

  // Draw edges between parent and children
  const edges: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];
  for (const node of tree) {
    const left = nodeMap.get(2 * node.index);
    const right = nodeMap.get(2 * node.index + 1);
    if (left) {
      edges.push({
        x1: scaleX(node.x), y1: scaleY(node.y),
        x2: scaleX(left.x), y2: scaleY(left.y),
        key: `e-${node.index}-${left.index}`,
      });
    }
    if (right) {
      edges.push({
        x1: scaleX(node.x), y1: scaleY(node.y),
        x2: scaleX(right.x), y2: scaleY(right.y),
        key: `e-${node.index}-${right.index}`,
      });
    }
  }

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Edges */}
      {edges.map((e) => (
        <line
          key={e.key}
          x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
          stroke="var(--color-border)"
          strokeWidth={1.5}
          opacity={0.5}
        />
      ))}

      {/* Nodes */}
      {tree.map((node) => {
        const cx = scaleX(node.x);
        const cy = scaleY(node.y);
        const isHighlighted = highlightedNodes.includes(node.index) || node.index === updatedNode;
        const isLeaf = node.rangeL === node.rangeR;

        return (
          <motion.g key={node.index}>
            {/* Glow ring for highlighted */}
            {isHighlighted && (
              <motion.circle
                cx={cx} cy={cy} r={NODE_RADIUS + 4}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth={2}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            )}

            <motion.circle
              cx={cx} cy={cy} r={NODE_RADIUS}
              animate={{ fill: getNodeFill(node.index) }}
              transition={spring}
              stroke={isHighlighted ? 'var(--color-accent)' : 'var(--color-border)'}
              strokeWidth={isHighlighted ? 2.5 : 1.5}
            />

            {/* Value */}
            <text
              x={cx} y={cy - 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={isLeaf ? 13 : 12}
              fontWeight={700}
              fontFamily="var(--font-mono)"
              fill={getNodeTextColor(node.index)}
              style={{ pointerEvents: 'none' }}
            >
              {node.value}
            </text>

            {/* Range label */}
            <text
              x={cx} y={cy + 12}
              textAnchor="middle"
              fontSize={8}
              fontFamily="var(--font-mono)"
              fill={getNodeTextColor(node.index)}
              opacity={0.7}
              style={{ pointerEvents: 'none' }}
            >
              [{node.rangeL},{node.rangeR}]
            </text>
          </motion.g>
        );
      })}

      {/* Base array display at bottom */}
      {baseArray.map((val, i) => {
        const cellW = 40;
        const totalW = baseArray.length * cellW;
        const startX = (WIDTH - totalW) / 2;
        const x = startX + i * cellW;
        const y = HEIGHT - 30;
        const inRange = queryRange && i >= queryRange[0] && i <= queryRange[1];

        return (
          <g key={`base-${i}`}>
            <rect
              x={x} y={y} width={cellW - 2} height={22} rx={3}
              fill={inRange ? 'var(--color-accent-secondary)' : 'var(--color-surface)'}
              stroke="var(--color-border)"
              strokeWidth={1}
            />
            <text
              x={x + (cellW - 2) / 2} y={y + 11}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={11}
              fontWeight={600}
              fontFamily="var(--font-mono)"
              fill={inRange ? '#fff' : 'var(--color-text)'}
              style={{ pointerEvents: 'none' }}
            >
              {val}
            </text>
            <text
              x={x + (cellW - 2) / 2} y={y - 5}
              textAnchor="middle"
              fontSize={8}
              fontFamily="var(--font-mono)"
              fill="var(--color-text-muted)"
              style={{ pointerEvents: 'none' }}
            >
              {i}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
