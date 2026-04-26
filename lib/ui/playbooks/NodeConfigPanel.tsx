'use client';

import SearchableDropdown, { type Option } from '@/lib/ui/inputs/SearchableDropdown';
import { type StepNodeData } from './StepNode';
import { FaXmark } from 'react-icons/fa6';

const ACTION_OPTIONS: Option[] = [
  { label: 'Start Instances', value: 'start-instances' },
  { label: 'Stop Instances', value: 'stop-instances' },
  { label: 'Restore Instances', value: 'restore-instances' },
];

type NodeConfigPanelProps = {
  nodeId: string;
  data: StepNodeData;
  onUpdate: (nodeId: string, data: Partial<StepNodeData>) => void;
  onDelete: () => void;
  onClose: () => void;
};

export default function NodeConfigPanel({ nodeId, data, onUpdate, onDelete, onClose }: NodeConfigPanelProps) {
  const selectedOption = ACTION_OPTIONS.find((o) => o.value === data.type) ?? null;

  return (
    <div className="absolute top-0 right-0 h-full w-[320px] bg-gray-900 border-l border-gray-700 z-50 shadow-2xl flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
        <h2 className="text-base font-semibold text-white">Configure Step</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition p-1 rounded hover:bg-gray-700"
          aria-label="Close panel"
        >
          <FaXmark className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Step type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Action Type
          </label>
          <SearchableDropdown
            options={ACTION_OPTIONS}
            value={selectedOption}
            onChange={(opt) => onUpdate(nodeId, { type: opt.value })}
          />
        </div>

        {/* Targets */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Target Instance IDs
          </label>
          <p className="text-xs text-gray-500 mb-2">Comma-separated EC2 instance IDs</p>
          <input
            type="text"
            className="form-input"
            placeholder="i-0123abc, i-0456def"
            value={data.targets.join(', ')}
            onChange={(e) => {
              const targets = e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
              onUpdate(nodeId, { targets });
            }}
          />
          {data.targets.length > 0 && (
            <ul className="mt-2 space-y-1">
              {data.targets.map((id) => (
                <li key={id} className="flex items-center justify-between text-xs text-gray-300 bg-gray-800 rounded px-2 py-1">
                  <span className="font-mono truncate">{id}</span>
                  <button
                    onClick={() => onUpdate(nodeId, { targets: data.targets.filter((t) => t !== id) })}
                    className="ml-2 text-gray-500 hover:text-red-400 transition"
                    aria-label={`Remove ${id}`}
                  >
                    <FaXmark className="w-3 h-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-700">
        <button
          onClick={onDelete}
          className="w-full px-4 py-2 bg-red-900/30 hover:bg-red-900/60 text-red-400 text-sm font-medium rounded border border-red-800/50 transition"
        >
          Delete Step
        </button>
      </div>
    </div>
  );
}
