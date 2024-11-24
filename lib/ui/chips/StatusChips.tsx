// /lib/ui/chips/StatusChip.tsx

import React from 'react';

type StatusChipProps = {
  status: 'running' | 'stopped' | 'terminated' | 'pending';
};

const StatusChip: React.FC<StatusChipProps> = ({ status }) => {
  let statusColor: string;

  switch (status) {
    case 'running':
      statusColor = 'bg-green-500';
      break;
    case 'stopped':
      statusColor = 'bg-yellow-500';
      break;
    case 'terminated':
      statusColor = 'bg-red-500';
      break;
    case 'pending':
      statusColor = 'bg-blue-500';
      break;
    default:
      statusColor = 'bg-gray-500';
  }

  return (
    <span
      className={`${statusColor} text-white py-1 px-3 rounded-full text-sm font-medium`}
    >
      {status}
    </span>
  );
};

export default StatusChip;
