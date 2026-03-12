import { useState } from 'react';
import { Button } from '../ui/Button';
import type { SearchInput } from '../../algorithms/searching/types';
import { parseArrayInput } from '../../lib/utils';
import { ARRAY_VALUE_MIN, ARRAY_VALUE_MAX } from '../../lib/constants';

interface SearchInputControlsProps {
  onApply: (input: SearchInput) => void;
}

export function SearchInputControls({ onApply }: SearchInputControlsProps) {
  const [arrayText, setArrayText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [size, setSize] = useState(10);

  const handleApply = () => {
    const arr = parseArrayInput(arrayText);
    const target = Number(targetText);
    if (arr && !isNaN(target)) {
      // Sort the array for binary search
      const sorted = [...arr].sort((a, b) => a - b);
      onApply({ values: sorted, target });
      setArrayText('');
      setTargetText('');
    }
  };

  const handleRandomSorted = () => {
    // Generate random sorted array
    const arr: number[] = [];
    for (let i = 0; i < size; i++) {
      arr.push(
        Math.floor(Math.random() * (ARRAY_VALUE_MAX - ARRAY_VALUE_MIN + 1)) + ARRAY_VALUE_MIN
      );
    }
    arr.sort((a, b) => a - b);

    // Pick a random target: 70% chance it exists in array, 30% chance it doesn't
    let target: number;
    if (Math.random() < 0.7) {
      target = arr[Math.floor(Math.random() * arr.length)];
    } else {
      target =
        Math.floor(Math.random() * (ARRAY_VALUE_MAX - ARRAY_VALUE_MIN + 1)) + ARRAY_VALUE_MIN;
    }

    onApply({ values: arr, target });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleApply();
  };

  const parsedArray = parseArrayInput(arrayText);
  const parsedTarget = Number(targetText);
  const isValid = parsedArray !== null && !isNaN(parsedTarget) && targetText.trim() !== '';

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Array input */}
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={arrayText}
          onChange={(e) => setArrayText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. 2, 5, 8, 11, 15"
          className="h-8 px-3 text-xs font-mono rounded-lg border border-[var(--color-border)]
                     bg-[var(--color-surface)] text-[var(--color-text)]
                     placeholder:text-[var(--color-text-muted)]
                     focus:outline-none focus:border-[var(--color-accent)]
                     transition-colors w-40"
        />
        <input
          type="number"
          value={targetText}
          onChange={(e) => setTargetText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Target"
          className="h-8 px-3 text-xs font-mono rounded-lg border border-[var(--color-border)]
                     bg-[var(--color-surface)] text-[var(--color-text)]
                     placeholder:text-[var(--color-text-muted)]
                     focus:outline-none focus:border-[var(--color-accent)]
                     transition-colors w-20"
        />
        <Button size="sm" onClick={handleApply} disabled={!isValid}>
          Search
        </Button>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-[var(--color-border)]" />

      {/* Random sorted with size */}
      <div className="flex items-center gap-1.5">
        <Button size="sm" variant="ghost" onClick={handleRandomSorted}>
          Random Sorted ({size})
        </Button>
        <input
          type="range"
          min={3}
          max={30}
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="w-16 h-1 accent-[var(--color-accent)] cursor-pointer"
        />
      </div>
    </div>
  );
}
