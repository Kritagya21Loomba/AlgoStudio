import { motion, AnimatePresence } from 'framer-motion';
import type { RBState } from '../../algorithms/tree/rb-types';

interface RBChartProps {
  state: RBState;
}

const WIDTH = 800;
const HEIGHT = 500;
const PAD_X = 40;
const PAD_Y = 40;
const NODE_RADIUS = 22;

const spring = { type: 'spring' as const, stiffness: 300, damping: 25 };

function scaleX(nx: number): number {
  return PAD_X + nx * (WIDTH - 2 * PAD_X);
}

function scaleY(ny: number): number {
  return PAD_Y + ny * (HEIGHT - 2 * PAD_Y);
}

export function RBChart({ state }: RBChartProps) {
  const { nodes, edges, current, justInserted, recoloredNodes, rotatingNodes } = state;
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  function getNodeFill(nodeId: string): string {
    const node = nodeMap.get(nodeId);
    if (!node) return 'var(--color-surface)';
    // Red-Black color takes priority
    if (node.color === 'red') return '#dc2626';
    return '#1f2937';
  }

  function getStroke(nodeId: string): string {
    if (nodeId === current) return 'var(--color-accent)';
    if (justInserted === nodeId) return 'var(--color-success)';
    if (recoloredNodes.includes(nodeId)) return 'var(--color-warning, #e67e22)';
    if (rotatingNodes.includes(nodeId)) return 'var(--color-accent)';
    return 'var(--color-border)';
  }

  function getStrokeWidth(nodeId: string): number {
    if (nodeId === current || justInserted === nodeId || recoloredNodes.includes(nodeId) || rotatingNodes.includes(nodeId)) return 3;
    return 1.5;
  }

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="rb-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Edges */}
      {edges.map((edge) => {
        const from = nodeMap.get(edge.from);
        const to = nodeMap.get(edge.to);
        if (!from || !to) return null;
        return (
          <motion.line
            key={`${edge.from}-${edge.to}`}
            x1={scaleX(from.x)} y1={scaleY(from.y)}
            x2={scaleX(to.x)} y2={scaleY(to.y)}
            stroke="var(--color-border)"
            strokeWidth={1.5}
            opacity={0.5}
            animate={{
              x1: scaleX(from.x), y1: scaleY(from.y),
              x2: scaleX(to.x), y2: scaleY(to.y),
            }}
            transition={spring}
          />
        );
      })}

      {/* Nodes */}
      <AnimatePresence>
        {nodes.map((node) => {
          const cx = scaleX(node.x);
          const cy = scaleY(node.y);
          const isActive = node.id === current || recoloredNodes.includes(node.id) || rotatingNodes.includes(node.id);

          return (
            <motion.g
              key={node.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={spring}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            >
              {/* Glow ring for active */}
              {isActive && (
                <motion.circle
                  cx={cx} cy={cy} r={NODE_RADIUS + 5}
                  fill="none"
                  stroke={node.id === current ? 'var(--color-accent)' : 'var(--color-warning, #e67e22)'}
                  strokeWidth={2}
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              )}

              {/* Node circle */}
              <motion.circle
                cx={cx} cy={cy} r={NODE_RADIUS}
                animate={{ fill: getNodeFill(node.id), cx, cy }}
                transition={spring}
                stroke={getStroke(node.id)}
                strokeWidth={getStrokeWidth(node.id)}
                filter={isActive ? 'url(#rb-glow)' : undefined}
              />

              {/* Value */}
              <motion.text
                x={cx} y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={13}
                fontWeight={700}
                fontFamily="var(--font-mono)"
                fill="#fff"
                animate={{ x: cx, y: cy }}
                transition={spring}
                style={{ pointerEvents: 'none' }}
              >
                {node.value}
              </motion.text>

              {/* Color label (R/B) */}
              <motion.text
                x={cx} y={cy + NODE_RADIUS + 14}
                textAnchor="middle"
                fontSize={10}
                fontWeight={700}
                fontFamily="var(--font-mono)"
                fill={node.color === 'red' ? '#dc2626' : 'var(--color-text-muted)'}
                animate={{ x: cx }}
                transition={spring}
                style={{ pointerEvents: 'none' }}
              >
                {node.color === 'red' ? 'R' : 'B'}
              </motion.text>

              {/* "NEW" badge on just-inserted */}
              {justInserted === node.id && (
                <motion.g
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <rect
                    x={cx - 14} y={cy - NODE_RADIUS - 18}
                    width={28} height={14} rx={3}
                    fill="var(--color-success)" opacity={0.9}
                  />
                  <text
                    x={cx} y={cy - NODE_RADIUS - 11}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={8} fontWeight="bold"
                    fontFamily="var(--font-mono)"
                    fill="#fff"
                    style={{ pointerEvents: 'none' }}
                  >
                    NEW
                  </text>
                </motion.g>
              )}
            </motion.g>
          );
        })}
      </AnimatePresence>
    </svg>
  );
}
