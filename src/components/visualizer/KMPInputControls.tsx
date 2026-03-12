import { useState } from 'react';
import type { KMPInput } from '../../algorithms/string/types';
import { DEFAULT_KMP_INPUT } from '../../algorithms/string/kmp';

interface KMPInputControlsProps {
  onApply: (input: KMPInput) => void;
}

export function KMPInputControls({ onApply }: KMPInputControlsProps) {
  const [text, setText] = useState(DEFAULT_KMP_INPUT.text);
  const [pattern, setPattern] = useState(DEFAULT_KMP_INPUT.pattern);

  const handleApply = () => {
    if (text.length === 0 || pattern.length === 0) return;
    if (pattern.length > text.length) return;
    onApply({ text, pattern });
  };

  const handleReset = () => {
    setText(DEFAULT_KMP_INPUT.text);
    setPattern(DEFAULT_KMP_INPUT.pattern);
    onApply(DEFAULT_KMP_INPUT);
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <label className="flex items-center gap-2 text-sm font-mono text-[var(--color-text-muted)]">
        Text:
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value.toUpperCase())}
          className="px-2 py-1 rounded-lg text-sm font-mono w-48
                     bg-[var(--color-surface)] border border-[var(--color-border)]
                     text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none"
          maxLength={30}
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-mono text-[var(--color-text-muted)]">
        Pattern:
        <input
          type="text"
          value={pattern}
          onChange={(e) => setPattern(e.target.value.toUpperCase())}
          className="px-2 py-1 rounded-lg text-sm font-mono w-36
                     bg-[var(--color-surface)] border border-[var(--color-border)]
                     text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none"
          maxLength={15}
        />
      </label>
      <button
        onClick={handleApply}
        className="px-3 py-1 rounded-lg text-sm font-mono cursor-pointer
                   bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
      >
        Search
      </button>
      <button
        onClick={handleReset}
        className="px-3 py-1 rounded-lg text-sm font-mono cursor-pointer
                   bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]
                   hover:text-[var(--color-text)] transition-colors"
      >
        Reset
      </button>
    </div>
  );
}
