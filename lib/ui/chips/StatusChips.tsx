// /lib/ui/chips/StatusChip.tsx

import React from 'react';

export type StatusChipVariant =
  | 'success'
  | 'warning'
  | 'error'
  | 'secondary'
  | 'info';

type StatusChipProps = {
  variant: StatusChipVariant;
  label: string;
  className?: string;
};

const variantMap: Record<StatusChipVariant, { text: string; bg: string; border: string }> = {
  success:   { text: 'text-green-300',  bg: 'bg-green-900 bg-opacity-40',  border: 'border-green-500' },
  warning:   { text: 'text-yellow-300', bg: 'bg-yellow-900 bg-opacity-40', border: 'border-yellow-500' },
  error:     { text: 'text-red-300',    bg: 'bg-red-900 bg-opacity-40',    border: 'border-red-500' },
  info:      { text: 'text-cyan-300',   bg: 'bg-cyan-900 bg-opacity-40',   border: 'border-cyan-500' },
  secondary: { text: 'text-gray-300',   bg: 'bg-gray-700 bg-opacity-40',   border: 'border-gray-500' },
};

const StatusChip: React.FC<StatusChipProps> = ({ variant, label, className }) => {
  const { text, bg, border } = variantMap[variant] ?? variantMap.secondary;

  return (
    <span
      className={`${bg} ${text} py-1 px-3 rounded-full text-sm font-medium border border-opacity-30 ${border} ${className ?? ''}`}
    >
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  );
};

export default StatusChip;
