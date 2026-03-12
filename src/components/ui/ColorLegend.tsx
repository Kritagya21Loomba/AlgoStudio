import { motion, AnimatePresence } from 'framer-motion';

interface LegendItem {
  color: string;
  label: string;
}

interface ColorLegendProps {
  items: LegendItem[];
}

export function ColorLegend({ items }: ColorLegendProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5"
          >
            <div
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs font-mono text-[var(--color-text-muted)]">
              {item.label}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
