import { useState } from 'react';
import { Button } from '../ui/Button';
import type { UnionFindInput, UFOperation } from '../../algorithms/union-find/types';

interface UnionFindInputControlsProps {
  onApply: (input: UnionFindInput) => void;
  elementCount: number;
}

export function UnionFindInputControls({ onApply, elementCount }: UnionFindInputControlsProps) {
  const [unionA, setUnionA] = useState('');
  const [unionB, setUnionB] = useState('');
  const [findX, setFindX] = useState('');
  const [n, setN] = useState(elementCount);

  const handleUnion = () => {
    const a = Number(unionA.trim());
    const b = Number(unionB.trim());
    if (!isNaN(a) && !isNaN(b) && a >= 0 && a < n && b >= 0 && b < n) {
      onApply({
        n,
        operations: [{ type: 'union', args: [a, b] }],
      });
      setUnionA('');
      setUnionB('');
    }
  };

  const handleFind = () => {
    const x = Number(findX.trim());
    if (!isNaN(x) && x >= 0 && x < n) {
      onApply({
        n,
        operations: [{ type: 'find', args: [x] }],
      });
      setFindX('');
    }
  };

  const handleRandom = () => {
    const ops: UFOperation[] = [];
    const count = Math.floor(Math.random() * 4) + 3; // 3-6 random unions
    for (let i = 0; i < count; i++) {
      const a = Math.floor(Math.random() * n);
      const b = Math.floor(Math.random() * n);
      if (a !== b) {
        ops.push({ type: 'union', args: [a, b] });
      }
    }
    // Add a find at the end
    ops.push({ type: 'find', args: [Math.floor(Math.random() * n)] });
    onApply({ n, operations: ops });
  };

  const handleReset = () => {
    onApply({ n, operations: [] });
  };

  const handleUnionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleUnion();
  };

  const handleFindKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleFind();
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Union controls */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-mono text-[var(--color-text-muted)]">Union(</span>
        <input
          type="number"
          value={unionA}
          onChange={(e) => setUnionA(e.target.value)}
          onKeyDown={handleUnionKeyDown}
          placeholder="a"
          min={0}
          max={n - 1}
          className="h-8 w-14 px-2 text-xs font-mono rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)]"
        />
        <span className="text-xs font-mono text-[var(--color-text-muted)]">,</span>
        <input
          type="number"
          value={unionB}
          onChange={(e) => setUnionB(e.target.value)}
          onKeyDown={handleUnionKeyDown}
          placeholder="b"
          min={0}
          max={n - 1}
          className="h-8 w-14 px-2 text-xs font-mono rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)]"
        />
        <span className="text-xs font-mono text-[var(--color-text-muted)]">)</span>
        <Button size="sm" onClick={handleUnion}>Union</Button>
      </div>

      <div className="w-px h-5 bg-[var(--color-border)]" />

      {/* Find controls */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-mono text-[var(--color-text-muted)]">Find(</span>
        <input
          type="number"
          value={findX}
          onChange={(e) => setFindX(e.target.value)}
          onKeyDown={handleFindKeyDown}
          placeholder="x"
          min={0}
          max={n - 1}
          className="h-8 w-14 px-2 text-xs font-mono rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)]"
        />
        <span className="text-xs font-mono text-[var(--color-text-muted)]">)</span>
        <Button size="sm" onClick={handleFind}>Find</Button>
      </div>

      <div className="w-px h-5 bg-[var(--color-border)]" />

      {/* Size + random + reset */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-mono text-[var(--color-text-muted)]">n={n}</span>
        <input
          type="range"
          min={4}
          max={16}
          value={n}
          onChange={(e) => setN(Number(e.target.value))}
          className="w-16 h-1 accent-[var(--color-accent)] cursor-pointer"
        />
        <Button size="sm" variant="ghost" onClick={handleRandom}>Random</Button>
        <Button size="sm" variant="ghost" onClick={handleReset}>Reset</Button>
      </div>
    </div>
  );
}
