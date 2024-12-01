// /lib/ui/chips/StatusChip.tsx

import React from 'react';

export type EC2Status =
  | 'running'
  | 'stopped'
  | 'stopping'
  | 'terminated'
  | 'pending';

type StatusChipProps = {
  status: EC2Status | string;
};

const StatusChip: React.FC<StatusChipProps> = ({ status }) => {
  let statusColor: string;

  switch (status) {
    case 'running':
      statusColor = 'bg-green-500';
      break;
    case 'stopping':
    case 'pending':
      statusColor = 'bg-yellow-500';
      break;
    case 'terminated':
    case 'stopped':
      statusColor = 'bg-red-500';
      break;
    default:
      statusColor = 'bg-gray-500';
  }

  return (
    <span
      className={`${statusColor} text-white py-1 px-3 rounded-full text-sm font-medium`}
    >
      {/* Display the status in title case */}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusChip;
