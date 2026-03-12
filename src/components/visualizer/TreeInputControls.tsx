import { useState } from 'react';
import { Button } from '../ui/Button';

interface TreeInputControlsProps {
  onInsert: (value: number) => void;
  onDelete: (value: number) => void;
  onRandom: () => void;
  onReset: () => void;
}

export function TreeInputControls({
  onInsert,
  onDelete,
  onRandom,
  onReset,
}: TreeInputControlsProps) {
  const [inputValue, setInputValue] = useState('');

  const parsedValue = parseInt(inputValue, 10);
  const isValid = !isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 999;

  const handleInsert = () => {
    if (isValid) {
      onInsert(parsedValue);
      setInputValue('');
    }
  };

  const handleDelete = () => {
    if (isValid) {
      onDelete(parsedValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) {
      handleInsert();
    }
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Value input */}
      <div className="flex items-center gap-1.5">
        <label className="text-xs font-mono text-[var(--color-text-muted)]">
          Value:
        </label>
        <input
          type="number"
          min={0}
          max={999}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="0-999"
          className="h-7 w-20 px-2 text-xs font-mono rounded-lg border border-[var(--color-border)]
                     bg-[var(--color-surface)] text-[var(--color-text)]
                     focus:outline-none focus:border-[var(--color-accent)]
                     transition-colors placeholder:text-[var(--color-text-muted)]"
        />
      </div>

      {/* Insert / Delete buttons */}
      <div className="flex items-center gap-1">
        <Button size="sm" variant="primary" onClick={handleInsert} disabled={!isValid}>
          Insert
        </Button>
        <Button size="sm" variant="secondary" onClick={handleDelete} disabled={!isValid}>
          Delete
        </Button>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-[var(--color-border)]" />

      {/* Random + Reset */}
      <div className="flex items-center gap-1">
        <Button size="sm" variant="ghost" onClick={onRandom}>
          Random BST
        </Button>
        <Button size="sm" variant="ghost" onClick={onReset}>
          Reset
        </Button>
      </div>
    </div>
  );
}
