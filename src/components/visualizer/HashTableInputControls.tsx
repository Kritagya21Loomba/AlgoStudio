import { useState } from 'react';
import { Button } from '../ui/Button';
import type { HashTableInput } from '../../algorithms/hashing/types';

interface HashTableInputControlsProps {
  onApply: (input: HashTableInput) => void;
  strategy: 'linear' | 'quadratic';
}

export function HashTableInputControls({ onApply, strategy }: HashTableInputControlsProps) {
  const [keyText, setKeyText] = useState('');
  const [tableSize, setTableSize] = useState(13);

  const handleInsertKey = () => {
    const key = Number(keyText.trim());
    if (!isNaN(key) && keyText.trim() !== '') {
      // Single key insertion: build input with just this key
      onApply({ keys: [key], tableSize, strategy });
      setKeyText('');
    }
  };

  const handleRandom = () => {
    const count = Math.floor(Math.random() * 4) + 5; // 5-8 keys
    const keys: number[] = [];
    for (let i = 0; i < count; i++) {
      keys.push(Math.floor(Math.random() * 99) + 1);
    }
    onApply({ keys, tableSize, strategy });
  };

  const handleReset = () => {
    onApply({ keys: [], tableSize, strategy });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleInsertKey();
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          value={keyText}
          onChange={(e) => setKeyText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Key"
          className="h-8 w-20 px-3 text-xs font-mono rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)]"
        />
        <Button size="sm" onClick={handleInsertKey} disabled={keyText.trim() === '' || isNaN(Number(keyText))}>
          Insert
        </Button>
      </div>

      <div className="w-px h-5 bg-[var(--color-border)]" />

      <div className="flex items-center gap-1.5">
        <span className="text-xs font-mono text-[var(--color-text-muted)]">Size: {tableSize}</span>
        <input
          type="range"
          min={7}
          max={31}
          step={2}
          value={tableSize}
          onChange={(e) => setTableSize(Number(e.target.value))}
          className="w-20 h-1 accent-[var(--color-accent)] cursor-pointer"
        />
      </div>

      <div className="w-px h-5 bg-[var(--color-border)]" />

      <div className="flex items-center gap-1.5">
        <Button size="sm" variant="ghost" onClick={handleRandom}>Random</Button>
        <Button size="sm" variant="ghost" onClick={handleReset}>Reset</Button>
      </div>
    </div>
  );
}
