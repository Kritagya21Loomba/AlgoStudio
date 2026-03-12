import { motion } from 'framer-motion';
import type { UnionFindState } from '../../algorithms/union-find/types';

interface UnionFindChartProps {
  state: UnionFindState;
}

const NODE_RADIUS = 14;
const PAD_X = 40;
const PAD_Y = 35;

export function UnionFindChart({ state }: UnionFindChartProps) {
  const { nodes, edges, highlightedNodes, compressingFrom, compressingTo, justUnioned } = state;

  if (nodes.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-[var(--color-text-muted)] font-mono text-sm">No elements</p>
      </div>
    );
  }

  const WIDTH = 700;
  const HEIGHT = 400;

  // Map node IDs to positions
  const posMap = new Map(nodes.map((n) => [n.id, n]));

  function nodeX(n: { x: number }) {
    return PAD_X + n.x * (WIDTH - PAD_X * 2);
  }

  function nodeY(n: { y: number }) {
    return PAD_Y + n.y * (HEIGHT - PAD_Y * 2);
  }

  const isHighlighted = (id: number) => highlightedNodes.includes(id);
  const isCompressing = (id: number) => id === compressingFrom;
  const isJustUnioned = (id: number) => justUnioned !== null && (id === justUnioned[0] || id === justUnioned[1]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <svg width="100%" height="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid meet">
        {/* Edges (parent pointers) */}
        {edges.map((edge, i) => {
          const from = posMap.get(edge.from);
          const to = posMap.get(edge.to);
          if (!from || !to) return null;

          const x1 = nodeX(from);
          const y1 = nodeY(from);
          const x2 = nodeX(to);
          const y2 = nodeY(to);

          const isCompressionEdge = compressingFrom === edge.from && compressingTo === edge.to;

          return (
            <motion.line
              key={`edge-${edge.from}-${edge.to}-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isCompressionEdge ? 'var(--color-accent)' : 'var(--color-border)'}
              strokeWidth={isCompressionEdge ? 2.5 : 1.5}
              strokeDasharray={isCompressionEdge ? '6 3' : 'none'}
              animate={{ x1, y1, x2, y2 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            />
          );
        })}

        {/* Arrow heads for edges */}
        <defs>
          <marker id="uf-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" fill="var(--color-border)" />
          </marker>
          <marker id="uf-arrow-accent" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" fill="var(--color-accent)" />
          </marker>
        </defs>

        {/* Nodes */}
        {nodes.map((node) => {
          const cx = nodeX(node);
          const cy = nodeY(node);
          const highlighted = isHighlighted(node.id);
          const compressing = isCompressing(node.id);
          const unioned = isJustUnioned(node.id);

          return (
            <motion.g
              key={`node-${node.id}`}
              animate={{ x: 0, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              {/* Highlight ring */}
              {(highlighted || compressing || unioned) && (
                <motion.circle
                  cx={cx}
                  cy={cy}
                  r={NODE_RADIUS + 4}
                  fill="none"
                  stroke={compressing ? 'var(--color-accent)' : unioned ? 'var(--color-success)' : 'var(--color-highlight)'}
                  strokeWidth={2}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [0.5, 1, 0.5], scale: 1 }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}

              {/* Node circle */}
              <motion.circle
                cx={cx}
                cy={cy}
                r={NODE_RADIUS}
                fill={node.setColor}
                fillOpacity={0.2}
                stroke={node.setColor}
                strokeWidth={highlighted ? 2.5 : 1.5}
                animate={{
                  cx, cy,
                  fillOpacity: highlighted ? 0.35 : 0.2,
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              />

              {/* Node ID */}
              <motion.text
                x={cx}
                y={cy + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--color-text)"
                fontSize={11}
                fontFamily="var(--font-mono)"
                fontWeight={700}
                animate={{ x: cx, y: cy + 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                {node.id}
              </motion.text>

              {/* Rank badge */}
              {node.rank > 0 && (
                <g>
                  <circle
                    cx={cx + NODE_RADIUS - 2}
                    cy={cy - NODE_RADIUS + 2}
                    r={6}
                    fill="var(--color-surface)"
                    stroke="var(--color-border)"
                    strokeWidth={1}
                  />
                  <text
                    x={cx + NODE_RADIUS - 2}
                    y={cy - NODE_RADIUS + 4}
                    textAnchor="middle"
                    fill="var(--color-text-muted)"
                    fontSize={7}
                    fontFamily="var(--font-mono)"
                    fontWeight={600}
                  >
                    r{node.rank}
                  </text>
                </g>
              )}
            </motion.g>
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
