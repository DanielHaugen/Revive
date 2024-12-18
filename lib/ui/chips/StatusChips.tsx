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

  switch (variant) {
    case 'success':
      statusColor = 'bg-green-500';
      break;
    case 'warning':
      statusColor = 'bg-yellow-500';
      break;
    case 'error':
      statusColor = 'bg-red-500';
      break;
    case 'info':
      statusColor = 'bg-cyan-500';
      break;
    case 'secondary':
    default:
      statusColor = 'bg-gray-500';
  }

  return (
    <span
      className={`${statusColor} text-white py-1 px-3 rounded-full text-sm font-medium ${className}`}
    >
      {/* Display the status in title case */}
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  );
};

export default StatusChip;
