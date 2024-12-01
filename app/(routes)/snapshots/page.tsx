'use client';

import StatusChip from '@/lib/ui/chips/StatusChips';
import PrimaryButton from '@/ui/buttons/PrimaryButton';
import DataTable, { Column } from '@/ui/tables/DataTable';
import { Snapshot } from '@aws-sdk/client-ec2';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaFilter, FaRegCopy } from 'react-icons/fa6';

const columns: Column<Snapshot>[] = [
  {
    header: 'Snapshot ID',
    accessor: 'SnapshotId',
    render: (value) => (
      <span className="flex items-center">
        {value as string}
        <FaRegCopy
          className="ml-2 cursor-pointer hover:text-blue-500 duration-100"
          title="Copy Snapshot ID"
          onClick={() => navigator.clipboard.writeText(value as string)}
        />
      </span>
    ),
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
    header: 'Volume Size',
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
      item.Tags?.map((tag) => `${tag.Key}: ${tag.Value}`).join(', ') || 'None',
    render: (value) => <span>{value as string}</span>,
  },
  {
    header: 'Status',
    accessor: (item) => item.State,
    render: (value) => <StatusChip status={value as string} />,
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
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSnapshots = async () => {
      try {
        const response = await fetch('/api/snapshots');
        if (!response.ok) {
          throw new Error('Failed to fetch snapshots');
        }
        const data = await response.json();
        setSnapshots(data);
      } catch (err) {
        setError(
          'Error fetching snapshots: ' +
            (err instanceof Error ? err.message : 'Unknown error')
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSnapshots();
  }, []);

  if (loading) {
    return <div>Loading snapshots...</div>;
  }

  if (error) {
    return <div>{error}</div>;
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
        <PrimaryButton onClick={() => {}} className="ml-auto">
          <div className="flex items-center">
            Filter <FaFilter className="ml-3" />
          </div>
        </PrimaryButton>
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
