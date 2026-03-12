import { motion, AnimatePresence } from 'framer-motion';

const ACTION_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  init: { label: 'Initializing', color: 'var(--color-text)', bg: 'var(--color-surface-alt)' },
  compare: { label: 'Comparing', color: 'var(--color-highlight)', bg: 'rgba(255,209,102,0.15)' },
  swap: { label: 'Swapping', color: 'var(--color-accent)', bg: 'rgba(230,57,70,0.12)' },
  shift: { label: 'Shifting', color: 'var(--color-accent-secondary)', bg: 'rgba(69,123,157,0.12)' },
  set: { label: 'Placing', color: 'var(--color-success)', bg: 'rgba(6,214,160,0.12)' },
  merge: { label: 'Merging', color: 'var(--color-accent)', bg: 'rgba(230,57,70,0.12)' },
  partition: { label: 'Partitioning', color: 'var(--color-success)', bg: 'rgba(6,214,160,0.12)' },
  done: { label: 'Complete', color: 'var(--color-success)', bg: 'rgba(6,214,160,0.12)' },
  found: { label: 'Found!', color: 'var(--color-success)', bg: 'rgba(6,214,160,0.15)' },
  eliminate: { label: 'Eliminating', color: 'var(--color-accent)', bg: 'rgba(230,57,70,0.12)' },
  visit: { label: 'Visiting', color: 'var(--color-accent)', bg: 'rgba(230,57,70,0.12)' },
  enqueue: { label: 'Enqueuing', color: 'var(--color-highlight)', bg: 'rgba(255,209,102,0.15)' },
  dequeue: { label: 'Dequeuing', color: 'var(--color-accent)', bg: 'rgba(230,57,70,0.12)' },
  push: { label: 'Pushing', color: 'var(--color-highlight)', bg: 'rgba(255,209,102,0.15)' },
  pop: { label: 'Popping', color: 'var(--color-accent)', bg: 'rgba(230,57,70,0.12)' },
  insert: { label: 'Inserting', color: 'var(--color-success)', bg: 'rgba(6,214,160,0.12)' },
  delete: { label: 'Deleting', color: 'var(--color-accent)', bg: 'rgba(230,57,70,0.12)' },
  highlight: { label: 'Traversing', color: 'var(--color-highlight)', bg: 'rgba(255,209,102,0.15)' },
  'rotate-left': { label: 'Rotating Left', color: 'var(--color-accent)', bg: 'rgba(230,57,70,0.12)' },
  'rotate-right': { label: 'Rotating Right', color: 'var(--color-accent)', bg: 'rgba(230,57,70,0.12)' },
  'balance-check': { label: 'Checking Balance', color: 'var(--color-highlight)', bg: 'rgba(255,209,102,0.15)' },
  probe: { label: 'Probing', color: 'var(--color-highlight)', bg: 'rgba(255,209,102,0.15)' },
  hash: { label: 'Hashing', color: 'var(--color-accent-secondary)', bg: 'rgba(69,123,157,0.12)' },
  collision: { label: 'Collision!', color: 'var(--color-accent)', bg: 'rgba(230,57,70,0.12)' },
  find: { label: 'Finding', color: 'var(--color-highlight)', bg: 'rgba(255,209,102,0.15)' },
  union: { label: 'Unioning', color: 'var(--color-success)', bg: 'rgba(6,214,160,0.12)' },
  compress: { label: 'Compressing', color: 'var(--color-accent-secondary)', bg: 'rgba(69,123,157,0.12)' },
  relax: { label: 'Relaxing', color: 'var(--color-success)', bg: 'rgba(6,214,160,0.12)' },
  recolor: { label: 'Recoloring', color: 'var(--color-accent)', bg: 'rgba(230,57,70,0.12)' },
  query: { label: 'Querying', color: 'var(--color-highlight)', bg: 'rgba(255,209,102,0.15)' },
  update: { label: 'Updating', color: 'var(--color-accent-secondary)', bg: 'rgba(69,123,157,0.12)' },
  match: { label: 'Match!', color: 'var(--color-success)', bg: 'rgba(6,214,160,0.12)' },
  mismatch: { label: 'Mismatch', color: 'var(--color-accent)', bg: 'rgba(230,57,70,0.12)' },
  'shift-pattern': { label: 'Shifting Pattern', color: 'var(--color-highlight)', bg: 'rgba(255,209,102,0.15)' },
};

interface ActionBadgeProps {
  action: string;
  description: string;
}

export function ActionBadge({ action, description }: ActionBadgeProps) {
  const config = ACTION_CONFIG[action] || ACTION_CONFIG.init;

  return (
    <div className="flex items-start gap-3 min-h-[3rem]">
      <AnimatePresence mode="wait">
        <motion.span
          key={action}
          initial={{ opacity: 0, scale: 0.85, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: -4 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider"
          style={{
            color: config.color,
            backgroundColor: config.bg,
            border: `1px solid ${config.color}`,
            borderColor: config.color,
            opacity: 0.9,
          }}
        >
          {config.label}
        </motion.span>
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <motion.p
          key={description}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 8 }}
          transition={{ duration: 0.15 }}
          className="text-sm text-[var(--color-text)] font-mono leading-relaxed pt-0.5"
        >
          {description}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
