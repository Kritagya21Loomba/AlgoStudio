import { useState } from 'react';
import { Button } from '../ui/Button';
import { generateRandomArray, parseArrayInput } from '../../lib/utils';
import { PRESETS } from '../../lib/constants';

interface InputControlsProps {
  onApply: (arr: number[]) => void;
}

export function InputControls({ onApply }: InputControlsProps) {
  const [inputText, setInputText] = useState('');
  const [size, setSize] = useState(10);

  const handleApply = () => {
    const arr = parseArrayInput(inputText);
    if (arr) {
      onApply(arr);
      setInputText('');
    }
  };

  const handleRandom = () => {
    const arr = generateRandomArray(size);
    onApply(arr);
  };

  const handlePreset = (presetSize: number) => {
    const arr = generateRandomArray(presetSize);
    onApply(arr);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleApply();
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Custom input */}
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. 5, 3, 8, 1, 2"
          className="h-8 px-3 text-xs font-mono rounded-lg border border-[var(--color-border)]
                     bg-[var(--color-surface)] text-[var(--color-text)]
                     placeholder:text-[var(--color-text-muted)]
                     focus:outline-none focus:border-[var(--color-accent)]
                     transition-colors w-40"
        />
        <Button size="sm" onClick={handleApply} disabled={!parseArrayInput(inputText)}>
          Apply
        </Button>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-[var(--color-border)]" />

      {/* Random with size */}
      <div className="flex items-center gap-1.5">
        <Button size="sm" variant="ghost" onClick={handleRandom}>
          Random ({size})
        </Button>
        <input
          type="range"
          min={3}
          max={50}
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="w-16 h-1 accent-[var(--color-accent)] cursor-pointer"
        />
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-[var(--color-border)]" />

      {/* Presets */}
      <div className="flex items-center gap-1">
        {(Object.entries(PRESETS) as [string, number][]).map(([label, presetSize]) => (
          <Button key={label} size="sm" variant="ghost" onClick={() => handlePreset(presetSize)}>
            {label.charAt(0).toUpperCase() + label.slice(1)}
          </Button>
        ))}
      </div>
    </div>
  );
}
