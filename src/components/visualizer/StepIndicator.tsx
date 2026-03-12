import { useVisualizerStore } from '../../stores/visualizer-store';

export function StepIndicator() {
  const currentStepIndex = useVisualizerStore((s) => s.currentStepIndex);
  const totalSteps = useVisualizerStore((s) => s.steps.length);

  return (
    <span className="text-xs font-mono text-[var(--color-text-muted)]">
      Step {currentStepIndex + 1} of {totalSteps}
    </span>
  );
}
