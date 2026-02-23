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

const StatusChip: React.FC<StatusChipProps> = ({
  variant,
  label,
  className,
}) => {
  let statusColor: string;
  let bgColor: string;

  switch (variant) {
    case 'success':
      statusColor = 'text-green-300';
      bgColor = 'bg-green-900 bg-opacity-40';
      break;
    case 'warning':
      statusColor = 'text-yellow-300';
      bgColor = 'bg-yellow-900 bg-opacity-40';
      break;
    case 'error':
      statusColor = 'text-red-300';
      bgColor = 'bg-red-900 bg-opacity-40';
      break;
    case 'info':
      statusColor = 'text-cyan-300';
      bgColor = 'bg-cyan-900 bg-opacity-40';
      break;
    case 'secondary':
    default:
      statusColor = 'text-gray-300';
      bgColor = 'bg-gray-700 bg-opacity-40';
  }

  return (
    <span
      className={`${bgColor} ${statusColor} py-1 px-3 rounded-full text-sm font-medium border border-opacity-30 ${
        variant === 'success' ? 'border-green-500' : ''
      } ${variant === 'warning' ? 'border-yellow-500' : ''} ${
        variant === 'error' ? 'border-red-500' : ''
      } ${variant === 'info' ? 'border-cyan-500' : ''} ${
        variant === 'secondary' ? 'border-gray-500' : ''
      } ${className}`}
    >
      {/* Display the status in title case */}
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  );
};

export default StatusChip;
