'use client';

import { Handle, Position } from '@xyflow/react';

const ACTION_LABELS: Record<string, string> = {
  'start-instances': 'Start Instances',
  'stop-instances': 'Stop Instances',
  'restore-instances': 'Restore Instances',
};

const ACTION_COLORS: Record<string, string> = {
  'start-instances': 'border-green-500',
  'stop-instances': 'border-red-500',
  'restore-instances': 'border-blue-500',
};

const ACTION_BADGE: Record<string, string> = {
  'start-instances': 'bg-green-900/40 text-green-400',
  'stop-instances': 'bg-red-900/40 text-red-400',
  'restore-instances': 'bg-blue-900/40 text-blue-400',
};

export type StepNodeData = {
  type: string;
  targets: string[];
  label?: string;
  isStart?: boolean;
};

export default function StepNode({ data }: { data: StepNodeData }) {
  const label = ACTION_LABELS[data.type] ?? data.type;
  const borderColor = ACTION_COLORS[data.type] ?? 'border-gray-600';
  const badgeColor = ACTION_BADGE[data.type] ?? 'bg-gray-800 text-gray-400';

  return (
    <div
      className={`bg-gray-800 border-2 ${borderColor} rounded-lg px-4 py-3 min-w-[180px] max-w-[240px] shadow-lg`}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-500" />

      {data.isStart && (
        <p className="text-[10px] font-bold text-teal-400 tracking-widest uppercase mb-2">▶ Entry Point</p>
      )}

      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded mb-2 ${badgeColor}`}>
        {label}
      </span>

      {data.targets.length > 0 ? (
        <ul className="text-xs text-gray-400 space-y-0.5">
          {data.targets.slice(0, 4).map((id) => (
            <li key={id} className="truncate font-mono">{id}</li>
          ))}
          {data.targets.length > 4 && (
            <li className="text-gray-500">+{data.targets.length - 4} more</li>
          )}
        </ul>
      ) : (
        <p className="text-xs text-gray-500 italic">No targets</p>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-gray-500" />
    </div>
  );
}
