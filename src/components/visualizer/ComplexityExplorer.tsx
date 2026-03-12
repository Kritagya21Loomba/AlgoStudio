import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { COMPLEXITY_CLASSES } from '../../lib/complexity-data';

const PAD_LEFT = 60;
const PAD_RIGHT = 20;
const PAD_TOP = 20;
const PAD_BOTTOM = 40;
const SVG_WIDTH = 700;
const SVG_HEIGHT = 400;

const CHART_W = SVG_WIDTH - PAD_LEFT - PAD_RIGHT;
const CHART_H = SVG_HEIGHT - PAD_TOP - PAD_BOTTOM;

export function ComplexityExplorer() {
  const [maxN, setMaxN] = useState(50);
  const [hovered, setHovered] = useState<number | null>(null);
  const [enabled, setEnabled] = useState<boolean[]>(COMPLEXITY_CLASSES.map(() => true));

  const toggleClass = (i: number) => {
    setEnabled((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  // Build chart data
  const data = useMemo(() => {
    const points = COMPLEXITY_CLASSES.map((cc) => {
      const pts: { x: number; y: number }[] = [];
      for (let n = 0; n <= maxN; n += Math.max(1, Math.floor(maxN / 100))) {
        pts.push({ x: n, y: cc.fn(n) });
      }
      return pts;
    });

    // Find max Y across enabled classes (capped so exponential doesn't blow up)
    let maxY = 0;
    for (let i = 0; i < COMPLEXITY_CLASSES.length; i++) {
      if (!enabled[i]) continue;
      for (const p of points[i]) {
        if (p.y < 1e8 && p.y > maxY) maxY = p.y;
      }
    }
    // Clamp exponential: cap at 2x the next-highest for readability
    if (maxY > maxN * maxN * 2) maxY = maxN * maxN * 2;
    if (maxY === 0) maxY = 1;

    return { points, maxY };
  }, [maxN, enabled]);

  function scaleX(n: number): number {
    return PAD_LEFT + (n / maxN) * CHART_W;
  }

  function scaleY(y: number): number {
    const clamped = Math.min(y, data.maxY);
    return PAD_TOP + CHART_H - (clamped / data.maxY) * CHART_H;
  }

  function buildPath(pts: { x: number; y: number }[]): string {
    return pts
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${scaleX(p.x).toFixed(1)},${scaleY(p.y).toFixed(1)}`)
      .join(' ');
  }

  // Y-axis ticks
  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = data.maxY / 5;
    for (let i = 0; i <= 5; i++) {
      ticks.push(Math.round(step * i));
    }
    return ticks;
  }, [data.maxY]);

  // X-axis ticks
  const xTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = Math.max(1, Math.floor(maxN / 5));
    for (let n = 0; n <= maxN; n += step) {
      ticks.push(n);
    }
    return ticks;
  }, [maxN]);

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col p-6 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="font-display text-3xl tracking-wide text-[var(--color-text)]">
          Complexity Explorer
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[var(--color-text-muted)]">
            n = {maxN}
          </span>
          <input
            type="range"
            min={10}
            max={200}
            step={10}
            value={maxN}
            onChange={(e) => setMaxN(Number(e.target.value))}
            className="w-32 h-1 accent-[var(--color-accent)] cursor-pointer"
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Chart area */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div className="flex-1 min-h-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
            <svg width="100%" height="100%" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} preserveAspectRatio="xMidYMid meet">
              {/* Grid lines */}
              {yTicks.map((tick, i) => (
                <g key={`y-${i}`}>
                  <line
                    x1={PAD_LEFT}
                    y1={scaleY(tick)}
                    x2={SVG_WIDTH - PAD_RIGHT}
                    y2={scaleY(tick)}
                    stroke="var(--color-border)"
                    strokeWidth={0.5}
                    strokeDasharray="4 4"
                  />
                  <text
                    x={PAD_LEFT - 8}
                    y={scaleY(tick) + 4}
                    textAnchor="end"
                    fill="var(--color-text-muted)"
                    fontSize={10}
                    fontFamily="var(--font-mono)"
                  >
                    {tick > 1000 ? `${(tick / 1000).toFixed(0)}k` : tick}
                  </text>
                </g>
              ))}

              {xTicks.map((tick, i) => (
                <g key={`x-${i}`}>
                  <line
                    x1={scaleX(tick)}
                    y1={PAD_TOP}
                    x2={scaleX(tick)}
                    y2={SVG_HEIGHT - PAD_BOTTOM}
                    stroke="var(--color-border)"
                    strokeWidth={0.5}
                    strokeDasharray="4 4"
                  />
                  <text
                    x={scaleX(tick)}
                    y={SVG_HEIGHT - PAD_BOTTOM + 16}
                    textAnchor="middle"
                    fill="var(--color-text-muted)"
                    fontSize={10}
                    fontFamily="var(--font-mono)"
                  >
                    {tick}
                  </text>
                </g>
              ))}

              {/* Axis labels */}
              <text
                x={SVG_WIDTH / 2}
                y={SVG_HEIGHT - 4}
                textAnchor="middle"
                fill="var(--color-text-muted)"
                fontSize={11}
                fontFamily="var(--font-mono)"
              >
                Input size (n)
              </text>
              <text
                x={12}
                y={SVG_HEIGHT / 2}
                textAnchor="middle"
                fill="var(--color-text-muted)"
                fontSize={11}
                fontFamily="var(--font-mono)"
                transform={`rotate(-90, 12, ${SVG_HEIGHT / 2})`}
              >
                Operations
              </text>

              {/* Curves */}
              {COMPLEXITY_CLASSES.map((cc, i) => {
                if (!enabled[i]) return null;
                const path = buildPath(data.points[i]);
                const isHovered = hovered === i;
                return (
                  <motion.path
                    key={cc.label}
                    d={path}
                    fill="none"
                    stroke={cc.color}
                    strokeWidth={isHovered ? 3 : 2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={hovered !== null && !isHovered ? 0.25 : 1}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1, opacity: hovered !== null && !isHovered ? 0.25 : 1 }}
                    transition={{ pathLength: { duration: 0.8, ease: 'easeOut' }, opacity: { duration: 0.2 } }}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ cursor: 'pointer' }}
                  />
                );
              })}

              {/* Curve labels at the end */}
              {COMPLEXITY_CLASSES.map((cc, i) => {
                if (!enabled[i]) return null;
                const pts = data.points[i];
                const lastPt = pts[pts.length - 1];
                const isHovered = hovered === i;
                return (
                  <text
                    key={`label-${cc.label}`}
                    x={scaleX(lastPt.x) + 4}
                    y={scaleY(lastPt.y)}
                    fill={cc.color}
                    fontSize={isHovered ? 12 : 10}
                    fontFamily="var(--font-mono)"
                    fontWeight={isHovered ? 700 : 500}
                    dominantBaseline="central"
                    opacity={hovered !== null && !isHovered ? 0.25 : 1}
                  >
                    {cc.label}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right sidebar — legend and algorithm mapping */}
        <div className="w-72 shrink-0 flex flex-col gap-4 overflow-y-auto">
          {/* Toggle classes */}
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
              Growth Rates
            </h3>
            <div className="space-y-2">
              {COMPLEXITY_CLASSES.map((cc, i) => (
                <button
                  key={cc.label}
                  className="flex items-center gap-2 w-full text-left cursor-pointer group"
                  onClick={() => toggleClass(i)}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <span
                    className="w-3 h-3 rounded-sm shrink-0"
                    style={{
                      backgroundColor: cc.color,
                      opacity: enabled[i] ? 1 : 0.2,
                    }}
                  />
                  <span
                    className="text-sm font-mono"
                    style={{
                      color: enabled[i] ? 'var(--color-text)' : 'var(--color-text-muted)',
                      textDecoration: enabled[i] ? 'none' : 'line-through',
                    }}
                  >
                    {cc.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Algorithm examples for hovered class */}
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
              {hovered !== null ? COMPLEXITY_CLASSES[hovered].label : 'Hover a curve'}
            </h3>
            {hovered !== null ? (
              <ul className="space-y-1">
                {COMPLEXITY_CLASSES[hovered].examples.map((ex) => (
                  <li key={ex} className="text-sm text-[var(--color-text)] flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: COMPLEXITY_CLASSES[hovered].color }}
                    />
                    {ex}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[var(--color-text-muted)]">
                Hover or click a growth rate to see which algorithms belong to it.
              </p>
            )}
          </div>

          {/* Quick reference table */}
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
              At n = {maxN}
            </h3>
            <div className="space-y-1">
              {COMPLEXITY_CLASSES.filter((_, i) => enabled[i]).map((cc) => {
                const val = cc.fn(maxN);
                const display = val > 1e9 ? '> 1B' : val > 1e6 ? `${(val / 1e6).toFixed(1)}M` : val > 1000 ? `${(val / 1000).toFixed(1)}K` : val.toFixed(val < 10 ? 1 : 0);
                return (
                  <div key={cc.label} className="flex items-center justify-between text-xs font-mono">
                    <span style={{ color: cc.color }}>{cc.label}</span>
                    <span className="text-[var(--color-text)]">{display}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
