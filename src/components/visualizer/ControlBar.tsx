import { motion } from 'framer-motion';
import { useVisualizerStore } from '../../stores/visualizer-store';
import { Button } from '../ui/Button';
import { StepIndicator } from './StepIndicator';
import { SPEED_MIN, SPEED_MAX } from '../../lib/constants';

export function ControlBar() {
  const isPlaying = useVisualizerStore((s) => s.isPlaying);
  const speed = useVisualizerStore((s) => s.speed);
  const currentStepIndex = useVisualizerStore((s) => s.currentStepIndex);
  const totalSteps = useVisualizerStore((s) => s.steps.length);
  const togglePlay = useVisualizerStore((s) => s.togglePlay);
  const stepForward = useVisualizerStore((s) => s.stepForward);
  const stepBackward = useVisualizerStore((s) => s.stepBackward);
  const reset = useVisualizerStore((s) => s.reset);
  const setSpeed = useVisualizerStore((s) => s.setSpeed);

  const atStart = currentStepIndex === 0;
  const atEnd = currentStepIndex >= totalSteps - 1;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Playback buttons */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={reset} disabled={atStart} title="Reset">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 1 9 9 9 9 0 0 1-6.36-2.64" />
            <polyline points="3 4 3 12 11 12" />
          </svg>
        </Button>
        <Button variant="ghost" size="sm" onClick={stepBackward} disabled={atStart} title="Step back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="19 20 9 12 19 4 19 20" />
            <line x1="5" y1="19" x2="5" y2="5" />
          </svg>
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={togglePlay}
          disabled={atEnd && !isPlaying}
          title={isPlaying ? 'Pause' : 'Play'}
          className="w-9 h-9 !p-0"
        >
          <motion.div
            key={isPlaying ? 'pause' : 'play'}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            {isPlaying ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </motion.div>
        </Button>
        <Button variant="ghost" size="sm" onClick={stepForward} disabled={atEnd} title="Step forward">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5 4 15 12 5 20 5 4" />
            <line x1="19" y1="5" x2="19" y2="19" />
          </svg>
        </Button>
      </div>

      {/* Step indicator */}
      <StepIndicator />

      {/* Speed slider */}
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-xs text-[var(--color-text-muted)]">Fast</span>
        <input
          type="range"
          min={SPEED_MIN}
          max={SPEED_MAX}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-24 h-1 accent-[var(--color-accent)] cursor-pointer"
        />
        <span className="text-xs text-[var(--color-text-muted)]">Slow</span>
      </div>
    </div>
  );
}
