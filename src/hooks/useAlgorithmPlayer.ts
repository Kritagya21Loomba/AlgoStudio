import { useEffect, useRef } from 'react';
import { useVisualizerStore } from '../stores/visualizer-store';

export function useAlgorithmPlayer() {
  const isPlaying = useVisualizerStore((s) => s.isPlaying);
  const speed = useVisualizerStore((s) => s.speed);
  const stepForward = useVisualizerStore((s) => s.stepForward);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        stepForward();
      }, speed);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, speed, stepForward]);
}
