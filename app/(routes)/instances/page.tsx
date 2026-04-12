'use client';

import { useMemo, useState } from 'react';
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
import { FaMagnifyingGlass } from 'react-icons/fa6';

const STATUS_OPTIONS: EC2Status[] = ['running', 'stopped', 'stopping', 'pending', 'terminated', 'shutting-down'];

function toTitleCase(s: string): string {
  return s.replace(/(^|-)(\w)/g, (_, _sep, c) => (_sep ? ' ' : '') + c.toUpperCase());
}

const InstancesPage = () => {
  const { data: instances = [], isLoading, error } = useInstances();
  const queryClient = useQueryClient();
  const router = useRouter();
  const refetch = () => queryClient.invalidateQueries({ queryKey: ['instances'] });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredInstances = useMemo(() => {
    let result = instances;

    if (statusFilter !== 'all') {
      result = result.filter((i) => i.State?.Name === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((i) => {
        const name = i.Tags?.find((t) => t.Key === 'Name')?.Value || '';
        return (
          name.toLowerCase().includes(q) ||
          i.InstanceId?.toLowerCase().includes(q) ||
          i.InstanceType?.toLowerCase().includes(q) ||
          i.PublicIpAddress?.toLowerCase().includes(q) ||
          i.PrivateIpAddress?.toLowerCase().includes(q) ||
          i.Tags?.some(
            (t) =>
              t.Key?.toLowerCase().includes(q) ||
              t.Value?.toLowerCase().includes(q)
          )
        );
      });
    }

    return result;
  }, [instances, search, statusFilter]);

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

      {/* Header + Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="shrink-0">
          <h1 className="text-3xl font-bold text-white">Instances</h1>
          <p className="text-gray-400 text-sm mt-1">
            {filteredInstances.length} of {instances.length} Resources
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
            <input
              type="text"
              placeholder="Search by name, ID, IP, type, or tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-72 bg-gray-800 border border-gray-700 rounded-md py-2 pl-9 pr-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-sm text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{toTitleCase(s)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <DataTable
          data={filteredInstances}
          columns={columns}
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
};

export default InstancesPage;
