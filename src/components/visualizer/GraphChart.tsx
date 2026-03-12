import { motion, AnimatePresence } from 'framer-motion';
import type { GraphState } from '../../algorithms/graph/types';

interface GraphChartProps {
  state: GraphState;
}

const WIDTH = 800;
const HEIGHT = 500;
const PAD_X = 60;
const PAD_Y = 50;
const NODE_RADIUS = 24;

const spring = { type: 'spring' as const, stiffness: 300, damping: 25 };

function scaleX(nx: number): number {
  return PAD_X + nx * (WIDTH - 2 * PAD_X);
}

function scaleY(ny: number): number {
  return PAD_Y + ny * (HEIGHT - 2 * PAD_Y);
}

export function GraphChart({ state }: GraphChartProps) {
  const { nodes, edges, visited, current, frontier, currentEdge, discoveryOrder } = state;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  function getNodeFill(nodeId: string): string {
    if (nodeId === current) return 'var(--color-accent)';
    if (frontier.includes(nodeId)) return 'var(--color-highlight)';
    if (visited.includes(nodeId)) return 'var(--color-accent-secondary)';
    return 'var(--color-surface)';
  }

  function getNodeStroke(nodeId: string): string {
    if (nodeId === current) return 'var(--color-accent)';
    if (frontier.includes(nodeId)) return 'var(--color-highlight)';
    if (visited.includes(nodeId)) return 'var(--color-accent-secondary)';
    return 'var(--color-border)';
  }

  function getNodeTextColor(nodeId: string): string {
    if (nodeId === current) return '#ffffff';
    if (frontier.includes(nodeId)) return 'var(--color-text)';
    if (visited.includes(nodeId)) return '#ffffff';
    return 'var(--color-text)';
  }

  function isCurrentEdge(from: string, to: string): boolean {
    if (!currentEdge) return false;
    return (
      (currentEdge[0] === from && currentEdge[1] === to) ||
      (currentEdge[0] === to && currentEdge[1] === from)
    );
  }

  function isEdgeToVisited(from: string, to: string): boolean {
    return visited.includes(from) && visited.includes(to);
  }

  function getEdgeStroke(from: string, to: string): string {
    if (isCurrentEdge(from, to)) return 'var(--color-accent)';
    if (isEdgeToVisited(from, to)) return 'var(--color-accent-secondary)';
    return 'var(--color-border)';
  }

  function getEdgeOpacity(from: string, to: string): number {
    if (isCurrentEdge(from, to)) return 1;
    if (isEdgeToVisited(from, to)) return 0.4;
    return 0.3;
  }

  function getEdgeWidth(from: string, to: string): number {
    if (isCurrentEdge(from, to)) return 3.5;
    if (isEdgeToVisited(from, to)) return 2;
    return 1.5;
  }

  // Get discovery order index for a node
  function getDiscoveryIndex(nodeId: string): number {
    return discoveryOrder.indexOf(nodeId);
  }

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="graph-current-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Arrow marker for current edge */}
        <marker
          id="edge-arrow-active"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="var(--color-accent)" />
        </marker>
      </defs>

      {/* Edges */}
      {edges.map((edge) => {
        const fromNode = nodeMap.get(edge.from);
        const toNode = nodeMap.get(edge.to);
        if (!fromNode || !toNode) return null;

        const x1 = scaleX(fromNode.x);
        const y1 = scaleY(fromNode.y);
        const x2 = scaleX(toNode.x);
        const y2 = scaleY(toNode.y);
        const isCurrent = isCurrentEdge(edge.from, edge.to);

        return (
          <motion.g key={`${edge.from}-${edge.to}`}>
            <motion.line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              animate={{
                stroke: getEdgeStroke(edge.from, edge.to),
                strokeWidth: getEdgeWidth(edge.from, edge.to),
                opacity: getEdgeOpacity(edge.from, edge.to),
              }}
              transition={{ duration: 0.3 }}
              strokeLinecap="round"
            />
            {/* Animated pulse on current edge */}
            {isCurrent && (
              <motion.line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="var(--color-accent)"
                strokeWidth={6}
                strokeLinecap="round"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.3, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </motion.g>
        );
      })}

      {/* Frontier ring indicators */}
      <AnimatePresence>
        {nodes.filter((n) => frontier.includes(n.id)).map((node) => {
          const cx = scaleX(node.x);
          const cy = scaleY(node.y);
          return (
            <motion.circle
              key={`frontier-ring-${node.id}`}
              cx={cx}
              cy={cy}
              r={NODE_RADIUS + 6}
              fill="none"
              stroke="var(--color-highlight)"
              strokeWidth={2}
              strokeDasharray="4 3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0.4, 0.8, 0.4], scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />
          );
        })}
      </AnimatePresence>

      {/* Current node glow ring */}
      {current && nodeMap.has(current) && (() => {
        const node = nodeMap.get(current)!;
        const cx = scaleX(node.x);
        const cy = scaleY(node.y);
        return (
          <motion.circle
            cx={cx}
            cy={cy}
            r={NODE_RADIUS + 4}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={2.5}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        );
      })()}

      {/* Nodes */}
      {nodes.map((node) => {
        const cx = scaleX(node.x);
        const cy = scaleY(node.y);
        const isCurrent = node.id === current;
        const discoveryIdx = getDiscoveryIndex(node.id);

        return (
          <motion.g key={node.id}>
            <motion.circle
              cx={cx}
              cy={cy}
              r={NODE_RADIUS}
              animate={{
                fill: getNodeFill(node.id),
                stroke: getNodeStroke(node.id),
                scale: isCurrent ? 1.15 : 1,
              }}
              transition={spring}
              strokeWidth={2}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
              filter={isCurrent ? 'url(#graph-current-glow)' : undefined}
            />
            {/* Node label */}
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="central"
              fill={getNodeTextColor(node.id)}
              fontSize={14}
              fontWeight={600}
              fontFamily="var(--font-mono)"
              style={{ pointerEvents: 'none' }}
            >
              {node.label}
            </text>
            {/* Discovery order badge */}
            <AnimatePresence>
              {discoveryIdx >= 0 && (
                <motion.g
                  key={`disc-${node.id}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={spring}
                  style={{ transformOrigin: `${cx + NODE_RADIUS - 2}px ${cy - NODE_RADIUS + 2}px` }}
                >
                  <circle
                    cx={cx + NODE_RADIUS - 2}
                    cy={cy - NODE_RADIUS + 2}
                    r={9}
                    fill="var(--color-surface)"
                    stroke="var(--color-accent-secondary)"
                    strokeWidth={1.5}
                  />
                  <text
                    x={cx + NODE_RADIUS - 2}
                    y={cy - NODE_RADIUS + 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="var(--color-accent-secondary)"
                    fontSize={8}
                    fontWeight={700}
                    fontFamily="var(--font-mono)"
                    style={{ pointerEvents: 'none' }}
                  >
                    {discoveryIdx + 1}
                  </text>
                </motion.g>
              )}
            </AnimatePresence>
            {/* "VISITING" label for current node */}
            {isCurrent && (
              <motion.g
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <rect
                  x={cx - 28}
                  y={cy + NODE_RADIUS + 6}
                  width={56}
                  height={16}
                  rx={3}
                  fill="var(--color-accent)"
                  opacity={0.15}
                />
                <text
                  x={cx}
                  y={cy + NODE_RADIUS + 17}
                  textAnchor="middle"
                  fill="var(--color-accent)"
                  fontSize={9}
                  fontWeight="bold"
                  fontFamily="var(--font-mono)"
                  style={{ pointerEvents: 'none' }}
                >
                  VISITING
                </text>
              </motion.g>
            )}
          </motion.g>
        );
      })}

      {/* Discovery order trail line */}
      {discoveryOrder.length >= 2 && (() => {
        const points = discoveryOrder
          .map((id) => nodeMap.get(id))
          .filter(Boolean)
          .map((n) => `${scaleX(n!.x)},${scaleY(n!.y)}`);
        if (points.length < 2) return null;
        return (
          <motion.polyline
            points={points.join(' ')}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            opacity={0.25}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
          />
        );
      })()}
    </svg>
  );
}
