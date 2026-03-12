import { motion } from 'framer-motion';
import { useThemeStore, type Theme } from '../../stores/theme-store';

const ICONS: Record<Theme, string> = {
  light: '☀',
  dark: '🌙',
  beige: '🍂',
};

const LABELS: Record<Theme, string> = {
  light: 'Light',
  dark: 'Dark',
  beige: 'Beige',
};

export function ThemeToggle() {
  const { theme, cycleTheme } = useThemeStore();

  return (
    <motion.button
      onClick={cycleTheme}
      className="relative flex items-center gap-2 px-3 py-1.5 rounded-full
                 bg-[var(--color-surface)] border border-[var(--color-border)]
                 hover:border-[var(--color-accent)] transition-colors duration-200
                 cursor-pointer text-sm"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch theme (current: ${LABELS[theme]})`}
    >
      <motion.span
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="text-base"
      >
        {ICONS[theme]}
      </motion.span>
      <span className="text-[var(--color-text-muted)] font-body">
        {LABELS[theme]}
      </span>
    </motion.button>
  );
}
