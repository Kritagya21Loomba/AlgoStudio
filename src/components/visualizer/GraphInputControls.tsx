import { useState } from 'react';
import { Button } from '../ui/Button';
import { graphPresets } from '../../lib/graph-presets';
import type { GraphInput } from '../../algorithms/graph/types';

interface GraphInputControlsProps {
  onApply: (input: GraphInput) => void;
}

const PRESET_LABELS: Record<string, string> = {
  small: 'Small',
  medium: 'Medium',
  'tree-like': 'Tree-like',
};

export function GraphInputControls({ onApply }: GraphInputControlsProps) {
  const [activePreset, setActivePreset] = useState<string>('small');
  const [startNodeId, setStartNodeId] = useState<string>(
    graphPresets['small'].startNodeId,
  );

  const currentPreset = graphPresets[activePreset];
  const nodes = currentPreset.nodes;

  const handlePresetChange = (presetKey: string) => {
    setActivePreset(presetKey);
    const preset = graphPresets[presetKey];
    setStartNodeId(preset.startNodeId);
    onApply({ ...preset, startNodeId: preset.startNodeId });
  };

  const handleStartNodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStartId = e.target.value;
    setStartNodeId(newStartId);
    onApply({ ...currentPreset, startNodeId: newStartId });
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Preset buttons */}
      <div className="flex items-center gap-1">
        {Object.entries(PRESET_LABELS).map(([key, label]) => (
          <Button
            key={key}
            size="sm"
            variant={activePreset === key ? 'primary' : 'ghost'}
            onClick={() => handlePresetChange(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-[var(--color-border)]" />

      {/* Start node selector */}
      <div className="flex items-center gap-1.5">
        <label className="text-xs font-mono text-[var(--color-text-muted)]">
          Start:
        </label>
        <select
          value={startNodeId}
          onChange={handleStartNodeChange}
          className="h-7 px-2 text-xs font-mono rounded-lg border border-[var(--color-border)]
                     bg-[var(--color-surface)] text-[var(--color-text)]
                     focus:outline-none focus:border-[var(--color-accent)]
                     transition-colors cursor-pointer"
        >
          {nodes.map((node) => (
            <option key={node.id} value={node.id}>
              {node.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
