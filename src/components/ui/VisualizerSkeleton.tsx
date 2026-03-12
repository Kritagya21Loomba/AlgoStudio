export function VisualizerSkeleton() {
  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col p-6 gap-4 animate-pulse">
      {/* Title bar */}
      <div className="flex items-center justify-between">
        <div className="h-9 w-56 rounded-lg bg-[var(--color-surface-alt,rgba(0,0,0,0.1))]" />
        <div className="flex gap-2">
          <div className="h-8 w-20 rounded-lg bg-[var(--color-surface-alt,rgba(0,0,0,0.1))]" />
          <div className="h-8 w-20 rounded-lg bg-[var(--color-surface-alt,rgba(0,0,0,0.1))]" />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Chart area */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="h-5 w-64 rounded bg-[var(--color-surface-alt,rgba(0,0,0,0.1))]" />
          <div className="flex-1 rounded-xl bg-[var(--color-surface-alt,rgba(0,0,0,0.1))]" />
          <div className="h-8 w-full rounded-lg bg-[var(--color-surface-alt,rgba(0,0,0,0.1))]" />
          <div className="h-10 w-full rounded-lg bg-[var(--color-surface-alt,rgba(0,0,0,0.1))]" />
        </div>

        {/* Sidebar */}
        <div className="w-72 shrink-0 flex flex-col gap-4">
          <div className="h-48 rounded-xl bg-[var(--color-surface-alt,rgba(0,0,0,0.1))]" />
          <div className="h-32 rounded-xl bg-[var(--color-surface-alt,rgba(0,0,0,0.1))]" />
        </div>
      </div>
    </div>
  );
}
