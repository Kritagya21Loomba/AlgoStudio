import { motion } from 'framer-motion';
import type { DijkstraState } from '../../algorithms/graph/dijkstra-types';

interface DijkstraChartProps {
  state: DijkstraState;
}

const WIDTH = 800;
const HEIGHT = 500;
const PAD_X = 60;
const PAD_Y = 50;
const NODE_RADIUS = 24;

const spring = { type: 'spring' as const, stiffness: 300, damping: 25 };

function scaleX(nx: number) { return PAD_X + nx * (WIDTH - 2 * PAD_X); }
function scaleY(ny: number) { return PAD_Y + ny * (HEIGHT - 2 * PAD_Y); }

export function DijkstraChart({ state }: DijkstraChartProps) {
  const { nodes, edges, visited, current, distances, priorityQueue, currentEdge, relaxedEdge } = state;
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const pqSet = new Set(priorityQueue.map((p) => p.id));

  function getNodeFill(id: string) {
    if (id === current) return 'var(--color-accent)';
    if (pqSet.has(id)) return 'var(--color-highlight)';
    if (visited.includes(id)) return 'var(--color-accent-secondary)';
    return 'var(--color-surface)';
  }

  function getNodeStroke(id: string) {
    if (id === current) return 'var(--color-accent)';
    if (pqSet.has(id)) return 'var(--color-highlight)';
    if (visited.includes(id)) return 'var(--color-accent-secondary)';
    return 'var(--color-border)';
  }

  function getTextColor(id: string) {
    if (id === current || visited.includes(id)) return '#fff';
    return 'var(--color-text)';
  }

  function isEdgeActive(from: string, to: string) {
    if (currentEdge && ((currentEdge[0] === from && currentEdge[1] === to) || (currentEdge[0] === to && currentEdge[1] === from))) return 'current';
    if (relaxedEdge && ((relaxedEdge[0] === from && relaxedEdge[1] === to) || (relaxedEdge[0] === to && relaxedEdge[1] === from))) return 'relaxed';
    return null;
  }

  return (
    <div className="w-full h-full">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Edges with weights */}
        {edges.map((edge, i) => {
          const fromNode = nodeMap.get(edge.from);
          const toNode = nodeMap.get(edge.to);
          if (!fromNode || !toNode) return null;

          const x1 = scaleX(fromNode.x);
          const y1 = scaleY(fromNode.y);
          const x2 = scaleX(toNode.x);
          const y2 = scaleY(toNode.y);
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;

          const status = isEdgeActive(edge.from, edge.to);
          const color = status === 'relaxed' ? 'var(--color-success)' : status === 'current' ? 'var(--color-accent)' : 'var(--color-border)';
          const width = status ? 2.5 : 1.5;

          // Offset weight label perpendicular to edge
          const dx = x2 - x1;
          const dy = y2 - y1;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const nx = -dy / len;
          const ny = dx / len;
          const labelOffset = 12;

          return (
            <g key={`edge-${i}`}>
              <motion.line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={color}
                strokeWidth={width}
                animate={{ stroke: color, strokeWidth: width }}
                transition={{ duration: 0.3 }}
              />
              {/* Weight label */}
              <rect
                x={mx + nx * labelOffset - 10}
                y={my + ny * labelOffset - 8}
                width={20}
                height={16}
                rx={4}
                fill="var(--color-surface)"
                stroke="var(--color-border)"
                strokeWidth={0.5}
                opacity={0.9}
              />
              <text
                x={mx + nx * labelOffset}
                y={my + ny * labelOffset + 4}
                textAnchor="middle"
                fill={status === 'relaxed' ? 'var(--color-success)' : status === 'current' ? 'var(--color-accent)' : 'var(--color-text-muted)'}
                fontSize={10}
                fontFamily="var(--font-mono)"
                fontWeight={600}
              >
                {edge.weight}
              </text>
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const cx = scaleX(node.x);
          const cy = scaleY(node.y);
          const dist = distances[node.id];
          const distLabel = dist === undefined || dist === Infinity ? '∞' : String(dist);

          return (
            <g key={node.id}>
              {/* Node circle */}
              <motion.circle
                cx={cx} cy={cy} r={NODE_RADIUS}
                fill={getNodeFill(node.id)}
                fillOpacity={node.id === current || visited.includes(node.id) ? 0.9 : 0.15}
                stroke={getNodeStroke(node.id)}
                strokeWidth={node.id === current ? 3 : 2}
                animate={{
                  fillOpacity: node.id === current || visited.includes(node.id) ? 0.9 : 0.15,
                  strokeWidth: node.id === current ? 3 : 2,
                }}
                transition={spring}
              />

              {/* Node label */}
              <text
                x={cx} y={cy + 1}
                textAnchor="middle" dominantBaseline="central"
                fill={getTextColor(node.id)}
                fontSize={14} fontFamily="var(--font-mono)" fontWeight={700}
              >
                {node.label}
              </text>

              {/* Distance badge */}
              <motion.g
                animate={{ opacity: 1 }}
                initial={{ opacity: 0 }}
                transition={{ delay: 0.1 }}
              >
                <rect
                  x={cx + NODE_RADIUS - 4}
                  y={cy - NODE_RADIUS - 4}
                  width={distLabel.length > 1 ? 28 : 20}
                  height={16}
                  rx={4}
                  fill={dist !== undefined && dist !== Infinity ? 'var(--color-accent)' : 'var(--color-surface)'}
                  stroke={dist !== undefined && dist !== Infinity ? 'var(--color-accent)' : 'var(--color-border)'}
                  strokeWidth={1}
                />
                <text
                  x={cx + NODE_RADIUS - 4 + (distLabel.length > 1 ? 14 : 10)}
                  y={cy - NODE_RADIUS + 8}
                  textAnchor="middle"
                  fill={dist !== undefined && dist !== Infinity ? '#fff' : 'var(--color-text-muted)'}
                  fontSize={9}
                  fontFamily="var(--font-mono)"
                  fontWeight={700}
                >
                  {distLabel}
                </text>
              </motion.g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
