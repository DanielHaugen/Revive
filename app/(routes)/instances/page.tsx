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
import Button from '@/lib/ui/buttons/Button';
import { FaMagnifyingGlass, FaPlay, FaStop, FaRotateRight } from 'react-icons/fa6';
import { startInstance, stopInstance, rebootInstance } from '@/lib/api/instances';
import { toast } from 'react-toastify';
import SlideOver from '@/lib/ui/panels/SlideOver';
import { InfoSection } from '@/lib/ui/info/InfoSection/InfoSection';
import Link from 'next/link';

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
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);
  const [slideOverInstance, setSlideOverInstance] = useState<Instance | null>(null);

  const handleBatchAction = async (action: 'start' | 'stop' | 'reboot') => {
    const ids = Array.from(selectedKeys);
    if (ids.length === 0) return;
    setBatchLoading(true);
    try {
      if (action === 'start') await startInstance(ids);
      else if (action === 'stop') await stopInstance(ids);
      else await rebootInstance(ids);
      toast.success(`${toTitleCase(action)} initiated for ${ids.length} instance(s)`);
      setSelectedKeys(new Set());
      refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : `Failed to ${action} instances`);
    } finally {
      setBatchLoading(false);
    }
  };

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
    // Check if the clicked element is a button, checkbox, or svg
    if (
      e.target instanceof HTMLButtonElement ||
      e.target instanceof SVGElement ||
      e.target instanceof HTMLInputElement
    )
      return;
    setSlideOverInstance(instance);
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

      {/* Batch Toolbar */}
      {selectedKeys.size > 0 && (
        <div className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
          <span className="text-sm text-gray-300 font-medium">
            {selectedKeys.size} selected
          </span>
          <div className="h-4 w-px bg-gray-600" />
          <Button
            onClick={() => handleBatchAction('start')}
            disabled={batchLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs"
            ariaLabel="Start selected instances"
          >
            <FaPlay className="text-[10px]" /> Start
          </Button>
          <Button
            onClick={() => handleBatchAction('stop')}
            disabled={batchLoading}
            variant="danger"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs"
            ariaLabel="Stop selected instances"
          >
            <FaStop className="text-[10px]" /> Stop
          </Button>
          <Button
            onClick={() => handleBatchAction('reboot')}
            disabled={batchLoading}
            variant="warning"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs"
            ariaLabel="Reboot selected instances"
          >
            <FaRotateRight className="text-[10px]" /> Reboot
          </Button>
          <button
            onClick={() => setSelectedKeys(new Set())}
            className="ml-auto text-xs text-gray-400 hover:text-gray-200 transition"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <DataTable
          data={filteredInstances}
          columns={columns}
          onRowClick={handleRowClick}
          selectable
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          getRowKey={(row) => row.InstanceId || ''}
        />
      </div>

      {/* Instance Detail Slide-Over */}
      <SlideOver
        isOpen={!!slideOverInstance}
        onClose={() => setSlideOverInstance(null)}
        title={
          slideOverInstance?.Tags?.find((t) => t.Key === 'Name')?.Value ||
          slideOverInstance?.InstanceId ||
          'Instance'
        }
      >
        {slideOverInstance && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <StatusChip
                variant={mapEC2StatusToVariant(
                  (slideOverInstance.State?.Name || 'Unknown') as EC2Status
                )}
                label={slideOverInstance.State?.Name || 'Unknown'}
              />
              <div className="flex items-center gap-2">
                <ActionButton
                  instance={slideOverInstance}
                  onClick={() => {
                    refetch();
                    setSlideOverInstance(null);
                  }}
                />
                <Link
                  href={`/instances/${slideOverInstance.InstanceId}`}
                  className="text-xs text-blue-400 hover:text-blue-300 transition"
                >
                  Full details →
                </Link>
              </div>
            </div>

            <InfoSection title="Instance Information">
              <InfoSection.Field label="Instance ID">
                {slideOverInstance.InstanceId && (
                  <Copy value={slideOverInstance.InstanceId} />
                )}
              </InfoSection.Field>
              <InfoSection.Field label="Type">
                {slideOverInstance.InstanceType}
              </InfoSection.Field>
              <InfoSection.Field label="Platform">
                {slideOverInstance.PlatformDetails}
              </InfoSection.Field>
              <InfoSection.Field label="Architecture">
                {slideOverInstance.Architecture}
              </InfoSection.Field>
              <InfoSection.Field label="Launched">
                {slideOverInstance.LaunchTime
                  ? new Date(slideOverInstance.LaunchTime).toLocaleDateString()
                  : 'Unknown'}
              </InfoSection.Field>
            </InfoSection>

            <InfoSection title="Networking">
              <InfoSection.Field label="Public IP">
                {slideOverInstance.PublicIpAddress ? (
                  <Copy value={slideOverInstance.PublicIpAddress} />
                ) : (
                  <span className="text-gray-500">—</span>
                )}
              </InfoSection.Field>
              <InfoSection.Field label="Private IP">
                {slideOverInstance.PrivateIpAddress && (
                  <Copy value={slideOverInstance.PrivateIpAddress} />
                )}
              </InfoSection.Field>
              <InfoSection.Field label="VPC ID">
                {slideOverInstance.VpcId && (
                  <Copy value={slideOverInstance.VpcId} />
                )}
              </InfoSection.Field>
            </InfoSection>

            <InfoSection
              title={`Tags ( ${slideOverInstance.Tags?.length || 0} )`}
            >
              {slideOverInstance.Tags && slideOverInstance.Tags.length > 0 ? (
                <div className="space-y-1">
                  {slideOverInstance.Tags.map((tag, idx) => (
                    <div
                      key={`${tag.Key}-${idx}`}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span className="text-gray-400 font-medium">
                        {tag.Key}:
                      </span>
                      <span className="text-gray-300">{tag.Value || '—'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No tags.</p>
              )}
            </InfoSection>

            <InfoSection
              title={`Volumes ( ${
                slideOverInstance.BlockDeviceMappings?.length || 0
              } )`}
            >
              {slideOverInstance.BlockDeviceMappings &&
              slideOverInstance.BlockDeviceMappings.length > 0 ? (
                <div className="space-y-1">
                  {slideOverInstance.BlockDeviceMappings.map((bdm, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm bg-gray-800 rounded px-3 py-1.5"
                    >
                      <span className="text-gray-400">{bdm.DeviceName}</span>
                      {bdm.Ebs?.VolumeId && (
                        <Link
                          href={`/volumes/${bdm.Ebs.VolumeId}`}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          {bdm.Ebs.VolumeId}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No volumes attached.</p>
              )}
            </InfoSection>
          </div>
        )}
      </SlideOver>
    </div>
  );
};

export default InstancesPage;
