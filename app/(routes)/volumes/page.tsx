'use client';

import { useMemo, useState } from 'react';
import Copy from '@/lib/ui/icons/Copy';
import Button from '@/lib/ui/buttons/Button';
import StatusChip from '@/lib/ui/chips/StatusChips';
import ConfirmationModal from '@/lib/ui/modals/ConfirmationModal';
import CreateVolumeModal from '@/lib/ui/modals/CreateVolumeModal';
import DataTable, { Column } from '@/lib/ui/tables/DataTable';
import { Volume } from '@aws-sdk/client-ec2';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaTrash, FaPlus, FaMagnifyingGlass } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import { VolumeState, mapVolumeStateToVariant } from '@/lib/constants/status';
import { useVolumes } from '@/lib/hooks/useVolumes';
import { useQueryClient } from '@tanstack/react-query';
import { TableSkeleton } from '@/lib/ui/feedback/Skeleton';
import ErrorBanner from '@/lib/ui/feedback/ErrorBanner';

const STATUS_OPTIONS: VolumeState[] = ['available', 'in-use', 'creating', 'deleting', 'deleted', 'error'];

function toTitleCase(s: string): string {
  return s.replace(/(^|-)(\w)/g, (_, _sep, c) => (_sep ? ' ' : '') + c.toUpperCase());
}

const VolumesPage = () => {
  const { data: volumes = [], isLoading, error } = useVolumes();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const availabilityZones = useMemo(() => {
    const zones = new Set(volumes.map((v) => v.AvailabilityZone).filter(Boolean) as string[]);
    return Array.from(zones).sort();
  }, [volumes]);

  const filteredVolumes = useMemo(() => {
    let result = volumes;

    if (statusFilter !== 'all') {
      result = result.filter((v) => v.State === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((v) =>
        v.VolumeId?.toLowerCase().includes(q) ||
        v.VolumeType?.toLowerCase().includes(q) ||
        v.AvailabilityZone?.toLowerCase().includes(q) ||
        v.Attachments?.some((a) => a.InstanceId?.toLowerCase().includes(q)) ||
        v.Tags?.some(
          (t) => t.Key?.toLowerCase().includes(q) || t.Value?.toLowerCase().includes(q)
        )
      );
    }

    return result;
  }, [volumes, search, statusFilter]);

  // Use the type guard in the render function
  const columns: Column<Volume>[] = [
    {
      header: 'Volume ID',
      accessor: 'VolumeId',
      render: (value) => <Copy value={value as string} title="Volume ID" />,
    },
    {
      header: 'Attachments',
      accessor: (item) => {
        return (
          <span>
            {item.Attachments?.map((item) => (
              <Link
                key={item.InstanceId}
                href={`/instances/${item.InstanceId}`}
                className="text-blue-500 hover:text-blue-600"
              >
                {item.InstanceId} ({item.State} to '{item.Device}')
              </Link>
            )) || []}
          </span>
        );
      },
      render: (value) => {
        return <span>{value as string}</span>;
      },
    },
    {
      header: 'Size',
      accessor: (item) => {
        return <span>{item.Size} GB</span>;
      },
      render: (value) => <span>{value as string}</span>,
    },
    {
      header: 'Type',
      accessor: 'VolumeType',
    },
    {
      header: 'Status',
      accessor: (item) => item.State || 'Unknown',
      render: (value, item) => {
        return (
          <StatusChip
            variant={mapVolumeStateToVariant(value as VolumeState)}
            label={value as VolumeState}
          />
        );
      },
    },
    {
      header: 'Actions',
      accessor: (item) => item as unknown as React.ReactNode,
      render: (value) => {
        const volume = value as unknown as Volume;
        return (
          <div className="flex gap-4 items-center">
            <Button
              onClick={() => onVolumeDeleteClicked(volume.VolumeId || '')}
              ariaLabel="Delete Playbook"
              className="flex items-center justify-center"
              variant="danger"
              title="Delete this Playbook"
            >
              <FaTrash className="text-white-600 my-1" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold text-white">Volumes</h1></div>
        <TableSkeleton rows={5} columns={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold text-white">Volumes</h1></div>
        <ErrorBanner message={error.message} />
      </div>
    );
  }

  // Function to handle row click
  const handleRowClick = (instance: Volume, e: React.MouseEvent) => {
    e.stopPropagation();
    // Check if the clicked element is a button or the svg in the button
    if (
      e.target instanceof HTMLButtonElement ||
      e.target instanceof HTMLAnchorElement ||
      e.target instanceof SVGElement
    )
      return;
    router.push(`/volumes/${instance.VolumeId}`); // Navigate to the instance page
  };

  const onVolumeDeleteClicked = async (volumeId: string) => {
    if (volumeId.trim().length == 0) return;
    setDeleteTarget(volumeId);
  };

  const confirmDeleteVolume = async () => {
    if (!deleteTarget) return;
    const volumeId = deleteTarget;
    setDeleteTarget(null);

    try {
      const response = await fetch(`/api/volumes/${volumeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['volumes'] });
        toast.success('Volume deleted successfully.');
      } else {
        const error = await response.json();
        toast.error(`Failed to delete volume: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting volume:', error);
      toast.error('An error occurred while deleting the volume.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header + Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="shrink-0">
          <h1 className="text-3xl font-bold text-white">Volumes</h1>
          <p className="text-gray-400 text-sm mt-1">
            {filteredVolumes.length} of {volumes.length} Resources
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
            <input
              type="text"
              placeholder="Search by ID, type, AZ, or instance..."
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
          <Button
            onClick={() => setShowCreate(true)}
            variant="primary"
            ariaLabel="Create Volume"
            className="flex items-center gap-2"
          >
            <FaPlus /> Create Volume
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <DataTable data={filteredVolumes} columns={columns} onRowClick={handleRowClick} />
      </div>

      <ConfirmationModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteVolume}
        message="Are you sure you want to delete this volume?"
      />

      <CreateVolumeModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        availabilityZones={availabilityZones}
      />
    </div>
  );
};

export default VolumesPage;
