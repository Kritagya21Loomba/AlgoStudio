import { motion, AnimatePresence } from 'framer-motion';
import { GlassPanel } from '../ui/GlassPanel';

interface FrontierPanelProps {
  items: string[];
  label: string; // "Queue" or "Stack"
}

export function FrontierPanel({ items, label }: FrontierPanelProps) {
  return (
    <GlassPanel>
      <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
        {label}
      </h3>
      <div className="flex items-center gap-1.5 flex-wrap min-h-[28px]">
        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <motion.span
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-[var(--color-text-muted)] font-mono italic"
            >
              Empty
            </motion.span>
          ) : (
            items.map((item, index) => (
              <motion.div
                key={`${item}-${index}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="inline-flex items-center justify-center w-7 h-7
                           rounded-md bg-[var(--color-surface)] border border-[var(--color-border)]
                           text-xs font-mono font-semibold text-[var(--color-text)]"
              >
                {item}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
      {items.length > 0 && (
        <p className="text-[10px] text-[var(--color-text-muted)] font-mono mt-1.5">
          {label === 'Queue' ? '\u2190 front' : 'top \u2192'}{' '}
          ({items.length} item{items.length !== 1 ? 's' : ''})
        </p>
      )}
    </GlassPanel>
  );
}
