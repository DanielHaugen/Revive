'use client';

import StatusChip from '@/lib/ui/chips/StatusChips';
import Copy from '@/lib/ui/icons/Copy';
import DataTable, { Column } from '@/lib/ui/tables/DataTable';
import { Snapshot } from '@aws-sdk/client-ec2';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SnapshotState, mapSnapshotStateToVariant } from '@/lib/constants/status';
import { useSnapshots } from '@/lib/hooks/useSnapshots';
import { TableSkeleton } from '@/lib/ui/feedback/Skeleton';
import ErrorBanner from '@/lib/ui/feedback/ErrorBanner';

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
];

const SnapshotsPage = () => {
  const { data: snapshots = [], isLoading, error } = useSnapshots();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="container mx-auto py-4">
        <h1 className="text-2xl font-semibold mb-4">EC2 Snapshots</h1>
        <TableSkeleton rows={5} columns={7} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-4">
        <h1 className="text-2xl font-semibold mb-4">EC2 Snapshots</h1>
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
    <div className="container mx-auto py-4">
      <div className="flex mb-4">
        <h1 className="text-2xl font-semibold">EC2 Snapshots</h1>
      </div>
      <DataTable
        data={snapshots}
        columns={columns}
        onRowClick={handleRowClick}
      />
    </div>
  );
};

export default SnapshotsPage;
