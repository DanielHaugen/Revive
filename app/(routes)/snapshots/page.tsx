'use client';

import { useMemo, useState } from 'react';
import StatusChip from '@/lib/ui/chips/StatusChips';
import Copy from '@/lib/ui/icons/Copy';
import DataTable, { Column } from '@/lib/ui/tables/DataTable';
import { Snapshot } from '@aws-sdk/client-ec2';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SnapshotState, mapSnapshotStateToVariant, SNAPSHOT_STATUS_OPTIONS } from '@/lib/constants/status';
import { useSnapshots } from '@/lib/hooks/useSnapshots';
import { TableSkeleton } from '@/lib/ui/feedback/Skeleton';
import ErrorBanner from '@/lib/ui/feedback/ErrorBanner';
import Button from '@/lib/ui/buttons/Button';
import ConfirmationModal from '@/lib/ui/modals/ConfirmationModal';
import { FaMagnifyingGlass, FaTrash } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';

function toTitleCase(s: string): string {
  return s.replace(/(^|-)(\w)/g, (_, _sep, c) => (_sep ? ' ' : '') + c.toUpperCase());
}

const SnapshotsPage = () => {
  const { data: snapshots = [], isLoading, error } = useSnapshots();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const columns: Column<Snapshot>[] = [
    {
      header: 'Snapshot ID',
      accessor: 'SnapshotId',
      render: (value) => <Copy value={value as string} title="Snapshot ID" />,
    },
    {
      header: 'Volume ID',
      accessor: 'VolumeId',
      render: (value) => (
        <Link
          href={`/volumes/${value}`}
          className="text-blue-500 hover:text-blue-600"
        >
          {value as string}
        </Link>
      ),
    },
    {
      header: 'Size',
      accessor: 'VolumeSize',
      render: (value) => <span>{value as number} GB</span>,
    },
    {
      header: 'Storage Tier',
      accessor: 'StorageTier',
    },
    {
      header: 'Tags',
      accessor: (item) =>
        item.Tags?.map((tag) => `${tag.Key}: ${tag.Value}`).join('\n') || 'None',
      render: (value) => <pre>{value as string}</pre>,
    },
    {
      header: 'Status',
      accessor: (item) => item.State,
      render: (value) => (
        <StatusChip
          variant={mapSnapshotStateToVariant(value as SnapshotState)}
          label={value as string}
        />
      ),
    },
    {
      header: 'Date Taken',
      accessor: 'StartTime',
      render: (value) => (
        <span>{new Date(value as string).toLocaleDateString()}</span>
      ),
    },
    {
      header: 'Actions',
      accessor: (item) => item as unknown as React.ReactNode,
      render: (value) => {
        const snapshot = value as unknown as Snapshot;
        return (
          <Button
            onClick={() => setDeleteTarget(snapshot.SnapshotId || '')}
            ariaLabel="Delete Snapshot"
            variant="danger"
            className="flex items-center justify-center"
          >
            <FaTrash className="text-white my-1" />
          </Button>
        );
      },
    },
  ];

  const filteredSnapshots = useMemo(() => {
    let result = snapshots;

    if (statusFilter !== 'all') {
      result = result.filter((s) => s.State === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((s) =>
        s.SnapshotId?.toLowerCase().includes(q) ||
        s.VolumeId?.toLowerCase().includes(q) ||
        s.Description?.toLowerCase().includes(q) ||
        s.Tags?.some(
          (t) => t.Key?.toLowerCase().includes(q) || t.Value?.toLowerCase().includes(q)
        )
      );
    }

    return result;
  }, [snapshots, search, statusFilter]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold text-white">Snapshots</h1></div>
        <TableSkeleton rows={5} columns={7} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold text-white">Snapshots</h1></div>
        <ErrorBanner message={error.message} />
      </div>
    );
  }

  // Function to handle row click
  const handleRowClick = (instance: Snapshot, e: React.MouseEvent) => {
    e.stopPropagation();
    // Check if the clicked element is a button or the svg in the button
    if (
      e.target instanceof HTMLButtonElement ||
      e.target instanceof HTMLAnchorElement ||
      e.target instanceof SVGElement
    )
      return;
    router.push(`/snapshots/${instance.SnapshotId}`); // Navigate to the instance page
  };

  return (
    <div className="space-y-6">
      {/* Header + Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="shrink-0">
          <h1 className="text-3xl font-bold text-white">Snapshots</h1>
          <p className="text-gray-400 text-sm mt-1">
            {filteredSnapshots.length} of {snapshots.length} Resources
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
            <input
              type="text"
              placeholder="Search by ID, volume, description, or tag..."
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
            {SNAPSHOT_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{toTitleCase(s)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <DataTable
          data={filteredSnapshots}
          columns={columns}
          onRowClick={handleRowClick}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          try {
            const res = await fetch(`/api/snapshots/${deleteTarget}`, { method: 'DELETE' });
            if (!res.ok) {
              const body = await res.json();
              throw new Error(body.error || 'Failed to delete snapshot');
            }
            toast.success('Snapshot deleted');
            queryClient.invalidateQueries({ queryKey: ['snapshots'] });
          } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete snapshot');
          } finally {
            setDeleteTarget(null);
          }
        }}
        message={`Are you sure you want to delete snapshot ${deleteTarget}? This action cannot be undone.`}
      />
    </div>
  );
};

export default SnapshotsPage;
