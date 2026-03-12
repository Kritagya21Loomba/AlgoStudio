import type { ReactNode } from 'react';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
}

export function GlassPanel({ children, className = '' }: GlassPanelProps) {
  return (
    <div
      className={`rounded-xl border border-[var(--color-glass-border)]
                  bg-[var(--color-glass)] backdrop-blur-md p-4 ${className}`}
    >
      {children}
    </div>
  );
}
