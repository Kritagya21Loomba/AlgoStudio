import { useVisualizerStore } from '../../stores/visualizer-store';
import { GlassPanel } from '../ui/GlassPanel';

export function ComplexityPanel() {
  const meta = useVisualizerStore((s) => s.meta);
  if (!meta) return null;

  const { complexity, stable } = meta;

  return (
    <GlassPanel>
      <h3 className="font-display text-lg tracking-wide mb-3 text-[var(--color-text)]">
        Complexity
      </h3>
      <div className="space-y-2 text-xs font-mono">
        <div className="flex justify-between">
          <span className="text-[var(--color-text-muted)]">Time (Best)</span>
          <span className="font-display text-base text-[var(--color-success)]">{complexity.time.best}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-text-muted)]">Time (Avg)</span>
          <span className="font-display text-base text-[var(--color-highlight)]">{complexity.time.average}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-text-muted)]">Time (Worst)</span>
          <span className="font-display text-base text-[var(--color-accent)]">{complexity.time.worst}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-text-muted)]">Space</span>
          <span className="font-display text-base text-[var(--color-text)]">{complexity.space}</span>
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-[var(--color-border)]">
          <span className="text-[var(--color-text-muted)]">Stable</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            stable
              ? 'bg-[var(--color-success)] text-white'
              : 'bg-[var(--color-accent)] text-white'
          }`}>
            {stable ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
    </GlassPanel>
  );
}
