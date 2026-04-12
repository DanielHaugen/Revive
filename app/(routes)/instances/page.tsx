'use client';

import Copy from '@/lib/ui/icons/Copy';
import StatusChip from '@/lib/ui/chips/StatusChips';
import DataTable, { Column } from '@/lib/ui/tables/DataTable';
import { Instance } from '@aws-sdk/client-ec2';
import { useRouter } from 'next/navigation';
import ActionButton from './components/ActionButton';
import { EC2Status, mapEC2StatusToVariant } from '@/lib/constants/status';
import { useInstances } from '@/lib/hooks/useInstances';
import { useQueryClient } from '@tanstack/react-query';
import { TableSkeleton } from '@/lib/ui/feedback/Skeleton';
import ErrorBanner from '@/lib/ui/feedback/ErrorBanner';

const InstancesPage = () => {
  const { data: instances = [], isLoading, error } = useInstances();
  const queryClient = useQueryClient();
  const router = useRouter();
  const refetch = () => queryClient.invalidateQueries({ queryKey: ['instances'] });

  // Use the type guard in the render function
  const columns: Column<Instance>[] = [
    {
      header: 'Instance ID',
      accessor: 'InstanceId',
      render: (value) => <Copy value={value as string} title="Instance ID" />,
    },
    {
      header: 'Name / Tags',
      accessor: (item) => {
        const nameTag = item.Tags?.find((tag) => tag.Key === 'Name');
        return nameTag ? nameTag.Value : 'Unnamed Instance';
      },
      render: (value) => <span>{value as string}</span>,
    },
    {
      header: 'Type',
      accessor: 'InstanceType',
    },
    {
      header: 'Status',
      accessor: (item) => item.State?.Name || 'Unknown',
      render: (value) => {
        return (
          <StatusChip
            variant={mapEC2StatusToVariant(value as EC2Status)}
            label={value as EC2Status}
          />
        );
      },
    },
    {
      header: 'Public IP',
      accessor: 'PublicIpAddress',
      render: (value) =>
        value ? (
          <Copy value={value as string} title="Public IP Address" />
        ) : (
          <span className="text-gray-500">—</span>
        ),
    },
    {
      header: 'Actions',
      accessor: (item) => item as React.ReactNode,
      render: (value) => {
        const instance = value as Instance;
        return (
          <ActionButton
            instance={instance}
            onClick={refetch}
          />
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold text-white">Instances</h1></div>
        <TableSkeleton rows={6} columns={6} />
      </div>
    );
  }

  // Function to handle row click
  const handleRowClick = (instance: Instance, e: React.MouseEvent) => {
    e.stopPropagation();
    // Check if the clicked element is a button or the svg in the button
    if (e.target instanceof HTMLButtonElement || e.target instanceof SVGElement)
      return;
    router.push(`/instances/${instance.InstanceId}`); // Navigate to the instance page
  };

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <ErrorBanner
          title="AWS Connection Error"
          message={error.message}
          onRetry={refetch}
        />
      )}

      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Instances</h1>
          <p className="text-gray-400 text-sm mt-1">
            {instances.length} Active Resources
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <DataTable
          data={instances}
          columns={columns}
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
};

export default InstancesPage;
