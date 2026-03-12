import { useEffect, useRef } from 'react';
import { useCompareStore } from '../stores/compare-store';

export function useComparePlayer() {
  const isPlaying = useCompareStore((s) => s.isPlaying);
  const speed = useCompareStore((s) => s.speed);
  const stepForward = useCompareStore((s) => s.stepForward);
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
