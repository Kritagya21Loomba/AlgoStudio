import { motion, AnimatePresence } from 'framer-motion';
import type { AVLState } from '../../algorithms/tree/avl-types';

interface AVLChartProps {
  state: AVLState;
}

const WIDTH = 800;
const MIN_HEIGHT = 500;
const PAD_X = 30;
const PAD_TOP = 40;
const PAD_BOTTOM = 60;
const NODE_RADIUS = 16;
const LEVEL_HEIGHT = 60;

const spring = { type: 'spring' as const, stiffness: 150, damping: 15 };
const springSmooth = { type: 'spring' as const, stiffness: 150, damping: 15 };

const ROTATION_LABELS: Record<string, string> = {
  LL: 'LL \u2014 Right Rotation',
  RR: 'RR \u2014 Left Rotation',
  LR: 'LR \u2014 Left-Right Rotation',
  RL: 'RL \u2014 Right-Left Rotation',
};

export function AVLChart({ state }: AVLChartProps) {
  const {
    nodes,
    edges,
    current,
    highlightPath,
    justInserted,
    justDeleted,
    comparedValue,
    message,
    balanceFactors,
    rotatingNodes,
    rotationType,
    unbalancedNode,
  } = state;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Compute dynamic height based on tree depth
  const distinctYs = new Set(nodes.map((n) => Math.round(n.y * 1000)));
  const depthLevels = Math.max(1, distinctYs.size - 1);
  const HEIGHT = Math.max(MIN_HEIGHT, PAD_TOP + PAD_BOTTOM + depthLevels * LEVEL_HEIGHT + NODE_RADIUS * 2);

  function scaleX(nx: number): number {
    return PAD_X + nx * (WIDTH - 2 * PAD_X);
  }

  function scaleY(ny: number): number {
    return PAD_TOP + ny * (HEIGHT - PAD_TOP - PAD_BOTTOM);
  }

  function isOnPath(nodeId: string): boolean {
    return highlightPath.includes(nodeId);
  }

  function isEdgeOnPath(from: string, to: string): boolean {
    const fromIdx = highlightPath.indexOf(from);
    const toIdx = highlightPath.indexOf(to);
    return fromIdx !== -1 && toIdx !== -1 && Math.abs(fromIdx - toIdx) === 1;
  }

  function isRotating(nodeId: string): boolean {
    return rotatingNodes.includes(nodeId);
  }

  function getNodeFill(nodeId: string): string {
    if (nodeId === justInserted) return 'var(--color-success)';
    if (nodeId === justDeleted) return 'var(--color-accent)';
    if (nodeId === current) return 'var(--color-accent)';
    return 'var(--color-surface)';
  }

  function getNodeStroke(nodeId: string): string {
    if (nodeId === unbalancedNode) return 'var(--color-accent)';
    if (isRotating(nodeId)) return 'var(--color-accent)';
    if (nodeId === current) return 'var(--color-accent)';
    if (nodeId === justInserted) return 'var(--color-success)';
    if (isOnPath(nodeId)) return 'var(--color-highlight)';
    return 'var(--color-border)';
  }

  function getNodeStrokeWidth(nodeId: string): number {
    if (nodeId === unbalancedNode) return 3;
    if (isRotating(nodeId)) return 3;
    if (nodeId === current) return 3;
    if (nodeId === justInserted) return 3;
    if (isOnPath(nodeId)) return 2.5;
    return 1.5;
  }

  function getNodeTextColor(nodeId: string): string {
    if (nodeId === justInserted) return '#ffffff';
    if (nodeId === justDeleted) return '#ffffff';
    if (nodeId === current) return '#ffffff';
    return 'var(--color-text)';
  }

  function getEdgeStroke(from: string, to: string): string {
    if (isEdgeOnPath(from, to)) return 'var(--color-highlight)';
    return 'var(--color-border)';
  }

  function getEdgeWidth(from: string, to: string): number {
    if (isEdgeOnPath(from, to)) return 2.5;
    return 1.5;
  }

  function getBalanceFactorColor(bf: number): string {
    if (bf >= -1 && bf <= 1) return 'var(--color-success)';
    return 'var(--color-accent)';
  }

  // Determine comparison direction for current node
  const currentNode = current ? nodeMap.get(current) : null;
  let comparisonDirection: 'left' | 'right' | 'match' | null = null;
  if (currentNode && comparedValue !== null) {
    if (comparedValue < currentNode.value) comparisonDirection = 'left';
    else if (comparedValue > currentNode.value) comparisonDirection = 'right';
    else comparisonDirection = 'match';
  }

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full"
      style={{ height: `${HEIGHT}px` }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="avl-node-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="avl-insert-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="avl-rotate-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Edges */}
      <AnimatePresence>
        {edges.map((edge) => {
          const fromNode = nodeMap.get(edge.from);
          const toNode = nodeMap.get(edge.to);
          if (!fromNode || !toNode) return null;

          const x1 = scaleX(fromNode.x);
          const y1 = scaleY(fromNode.y);
          const x2 = scaleX(toNode.x);
          const y2 = scaleY(toNode.y);
          const onPath = isEdgeOnPath(edge.from, edge.to);

          return (
            <motion.g key={`edge-${edge.from}-${edge.to}`}>
              <motion.line
                initial={{ opacity: 0 }}
                animate={{
                  x1, y1, x2, y2,
                  stroke: getEdgeStroke(edge.from, edge.to),
                  strokeWidth: getEdgeWidth(edge.from, edge.to),
                  opacity: 1,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                strokeLinecap="round"
              />
              {/* Highlight pulse on traversal path edges */}
              {onPath && (
                <motion.line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="var(--color-highlight)"
                  strokeWidth={5}
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.2, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              )}
            </motion.g>
          );
        })}
      </AnimatePresence>

      {/* Direction indicator arrow from current node */}
      <AnimatePresence>
        {current && currentNode && comparisonDirection && comparisonDirection !== 'match' && (
          <motion.g
            key={`dir-${current}-${comparisonDirection}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.25 }}
          >
            {(() => {
              const cx = scaleX(currentNode.x);
              const cy = scaleY(currentNode.y);
              const isLeft = comparisonDirection === 'left';
              const arrowX = isLeft ? cx - NODE_RADIUS - 18 : cx + NODE_RADIUS + 18;
              const arrowY = cy + NODE_RADIUS + 10;
              const points = isLeft
                ? `${arrowX},${arrowY} ${arrowX + 10},${arrowY - 6} ${arrowX + 10},${arrowY + 6}`
                : `${arrowX},${arrowY} ${arrowX - 10},${arrowY - 6} ${arrowX - 10},${arrowY + 6}`;
              const labelText = comparedValue !== null
                ? `${comparedValue} ${isLeft ? '<' : '>'} ${currentNode.value}`
                : isLeft ? 'go left' : 'go right';

              return (
                <>
                  <polygon points={points} fill="var(--color-highlight)" />
                  <text
                    x={arrowX}
                    y={arrowY + 16}
                    textAnchor="middle"
                    fill="var(--color-highlight)"
                    fontSize={9}
                    fontWeight="bold"
                    fontFamily="var(--font-mono)"
                  >
                    {labelText}
                  </text>
                </>
              );
            })()}
          </motion.g>
        )}
      </AnimatePresence>

      {/* Comparison box at current node */}
      <AnimatePresence>
        {current && currentNode && comparedValue !== null && (
          <motion.g
            key={`cmp-${current}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {(() => {
              const cx = scaleX(currentNode.x);
              const cy = scaleY(currentNode.y);
              const boxY = cy - NODE_RADIUS - 24;
              const sym = comparedValue === currentNode.value
                ? '='
                : comparedValue < currentNode.value
                  ? '<'
                  : '>';
              const color = comparedValue === currentNode.value
                ? 'var(--color-success)'
                : 'var(--color-highlight)';

              return (
                <>
                  <rect
                    x={cx - 40}
                    y={boxY}
                    width={80}
                    height={20}
                    rx={4}
                    fill={color}
                    opacity={0.15}
                  />
                  <rect
                    x={cx - 40}
                    y={boxY}
                    width={80}
                    height={20}
                    rx={4}
                    fill="none"
                    stroke={color}
                    strokeWidth={1}
                    opacity={0.4}
                  />
                  <text
                    x={cx}
                    y={boxY + 13}
                    textAnchor="middle"
                    fill={color}
                    fontSize={10}
                    fontWeight="bold"
                    fontFamily="var(--font-mono)"
                  >
                    {comparedValue} {sym} {currentNode.value}
                  </text>
                </>
              );
            })()}
          </motion.g>
        )}
      </AnimatePresence>

      {/* Rotation type floating label */}
      <AnimatePresence>
        {rotationType && (
          <motion.g
            key={`rot-label-${rotationType}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <rect
              x={WIDTH / 2 - 100}
              y={HEIGHT - 40}
              width={200}
              height={28}
              rx={6}
              fill="var(--color-accent)"
              opacity={0.15}
            />
            <rect
              x={WIDTH / 2 - 100}
              y={HEIGHT - 40}
              width={200}
              height={28}
              rx={6}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth={1.5}
              opacity={0.5}
            />
            <text
              x={WIDTH / 2}
              y={HEIGHT - 22}
              textAnchor="middle"
              fill="var(--color-accent)"
              fontSize={12}
              fontWeight="bold"
              fontFamily="var(--font-mono)"
            >
              {ROTATION_LABELS[rotationType] ?? rotationType}
            </text>
          </motion.g>
        )}
      </AnimatePresence>

      {/* Nodes */}
      <AnimatePresence>
        {nodes.map((node) => {
          const cx = scaleX(node.x);
          const cy = scaleY(node.y);
          const isNew = node.id === justInserted;
          const isDeleting = node.id === justDeleted;
          const isCurrent = node.id === current;
          const isUnbalanced = node.id === unbalancedNode;
          const isRotatingNode = isRotating(node.id);
          const bf = balanceFactors[node.id] ?? node.balanceFactor;

          return (
            <motion.g
              key={node.id}
              initial={isNew ? { scale: 0, opacity: 0 } : false}
              animate={{
                x: 0,
                y: 0,
                scale: isDeleting ? 0 : 1,
                opacity: isDeleting ? 0 : 1,
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={spring}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            >
              {/* Unbalanced node: red pulsing ring */}
              {isUnbalanced && (
                <motion.circle
                  cx={cx}
                  cy={cy}
                  r={NODE_RADIUS + 7}
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth={2.5}
                  animate={{ opacity: [0.2, 0.8, 0.2] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
              {/* Rotating node: glow effect */}
              {isRotatingNode && !isUnbalanced && (
                <motion.circle
                  cx={cx}
                  cy={cy}
                  r={NODE_RADIUS + 5}
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  filter="url(#avl-rotate-glow)"
                  style={{ transformOrigin: `${cx}px ${cy}px` }}
                />
              )}
              {/* Glow ring for current */}
              {isCurrent && !isUnbalanced && !isRotatingNode && (
                <motion.circle
                  cx={cx}
                  cy={cy}
                  r={NODE_RADIUS + 5}
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  animate={{ opacity: [0.2, 0.6, 0.2] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              )}
              {/* Glow ring for newly inserted */}
              {isNew && (
                <motion.circle
                  cx={cx}
                  cy={cy}
                  r={NODE_RADIUS + 5}
                  fill="none"
                  stroke="var(--color-success)"
                  strokeWidth={2.5}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0.3, 0.7, 0.3], scale: 1 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  filter="url(#avl-insert-glow)"
                  style={{ transformOrigin: `${cx}px ${cy}px` }}
                />
              )}
              {/* Main circle */}
              <motion.circle
                cx={cx}
                cy={cy}
                r={NODE_RADIUS}
                animate={{
                  cx, cy,
                  fill: getNodeFill(node.id),
                  stroke: getNodeStroke(node.id),
                  strokeWidth: getNodeStrokeWidth(node.id),
                }}
                transition={springSmooth}
                filter={
                  isRotatingNode
                    ? 'url(#avl-rotate-glow)'
                    : isCurrent
                      ? 'url(#avl-node-glow)'
                      : undefined
                }
              />
              {/* Value text */}
              <motion.text
                x={cx}
                y={cy}
                animate={{ x: cx, y: cy }}
                transition={springSmooth}
                textAnchor="middle"
                dominantBaseline="central"
                fill={getNodeTextColor(node.id)}
                fontSize={11}
                fontWeight={600}
                fontFamily="var(--font-mono)"
                style={{ pointerEvents: 'none' }}
              >
                {node.value}
              </motion.text>
              {/* Balance factor badge: small circle at top-right */}
              <motion.circle
                cx={cx + NODE_RADIUS - 2}
                cy={cy - NODE_RADIUS + 2}
                r={7}
                animate={{
                  cx: cx + NODE_RADIUS - 2,
                  cy: cy - NODE_RADIUS + 2,
                  fill: getBalanceFactorColor(bf),
                }}
                transition={springSmooth}
                opacity={0.9}
              />
              <motion.text
                x={cx + NODE_RADIUS - 2}
                y={cy - NODE_RADIUS + 2}
                animate={{
                  x: cx + NODE_RADIUS - 2,
                  y: cy - NODE_RADIUS + 2,
                }}
                transition={springSmooth}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#ffffff"
                fontSize={8}
                fontWeight={700}
                fontFamily="var(--font-mono)"
                style={{ pointerEvents: 'none' }}
              >
                {bf > 0 ? `+${bf}` : bf}
              </motion.text>
              {/* "INSERTED" label */}
              {isNew && (
                <motion.g
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <rect
                    x={cx - 28}
                    y={cy + NODE_RADIUS + 6}
                    width={56}
                    height={16}
                    rx={3}
                    fill="var(--color-success)"
                    opacity={0.15}
                  />
                  <text
                    x={cx}
                    y={cy + NODE_RADIUS + 17}
                    textAnchor="middle"
                    fill="var(--color-success)"
                    fontSize={8}
                    fontWeight="bold"
                    fontFamily="var(--font-mono)"
                    letterSpacing={1}
                    style={{ pointerEvents: 'none' }}
                  >
                    INSERTED
                  </text>
                </motion.g>
              )}
              {/* "DELETING" label */}
              {isDeleting && (
                <motion.g
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
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
                    fontSize={8}
                    fontWeight="bold"
                    fontFamily="var(--font-mono)"
                    letterSpacing={1}
                    style={{ pointerEvents: 'none' }}
                  >
                    DELETING
                  </text>
                </motion.g>
              )}
            </motion.g>
          );
        })}
      </AnimatePresence>

      {/* Info message overlay at top */}
      {message && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <rect
            x={8}
            y={8}
            width={280}
            height={22}
            rx={4}
            fill="var(--color-surface)"
            opacity={0.85}
            stroke="var(--color-border)"
            strokeWidth={1}
          />
          <text
            x={148}
            y={23}
            textAnchor="middle"
            fill="var(--color-text-muted)"
            fontSize={10}
            fontFamily="var(--font-mono)"
          >
            {message}
          </text>
        </motion.g>
      )}
    </svg>
  );
}
