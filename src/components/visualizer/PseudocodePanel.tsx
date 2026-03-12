import { motion } from 'framer-motion';
import { useVisualizerStore } from '../../stores/visualizer-store';
import { GlassPanel } from '../ui/GlassPanel';

export function PseudocodePanel() {
  const meta = useVisualizerStore((s) => s.meta);
  const steps = useVisualizerStore((s) => s.steps);
  const currentStepIndex = useVisualizerStore((s) => s.currentStepIndex);

  if (!meta) return null;

  const currentStep = steps[currentStepIndex];
  const activeLines = currentStep?.activeLines ?? [];

  return (
    <GlassPanel className="flex-1 overflow-hidden">
      <h3 className="font-display text-lg tracking-wide mb-3 text-[var(--color-text)]">
        Pseudocode
      </h3>
      <div className="font-mono text-xs leading-relaxed space-y-0.5">
        {meta.pseudocode.map((line, i) => {
          const isActive = activeLines.includes(i);
          return (
            <div key={i} className="relative flex items-start gap-2">
              {isActive && (
                <motion.div
                  layoutId="pseudo-highlight"
                  className="absolute inset-0 -mx-2 rounded bg-[var(--color-accent)] opacity-15"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="w-5 text-right text-[var(--color-text-muted)] opacity-50 shrink-0 select-none">
                {i + 1}
              </span>
              <span
                className={`relative z-10 whitespace-pre transition-colors duration-200 ${
                  isActive
                    ? 'text-[var(--color-accent)] font-medium'
                    : 'text-[var(--color-text-muted)]'
                }`}
              >
                {line}
              </span>
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
}
