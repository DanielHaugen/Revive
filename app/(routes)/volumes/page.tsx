'use client';

import Copy from '@/lib/ui/icons/Copy';
import Button from '@/lib/ui/buttons/Button';
import StatusChip from '@/lib/ui/chips/StatusChips';
import ConfirmationModal from '@/lib/ui/modals/ConfirmationModal';
import DataTable, { Column } from '@/lib/ui/tables/DataTable';
import { Volume } from '@aws-sdk/client-ec2';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaTrash } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import { VolumeState, mapVolumeStateToVariant } from '@/lib/constants/status';
import { useVolumes } from '@/lib/hooks/useVolumes';
import { useQueryClient } from '@tanstack/react-query';

const VolumesPage = () => {
  const { data: volumes = [], isLoading, error } = useVolumes();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

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
    return <div>Loading volumes...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
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
    <div className="container mx-auto py-4">
      <div className="flex mb-4">
        <h1 className="text-2xl font-semibold">EC2 Volumes</h1>
      </div>
      {/* Pass the volumes and columns to the DataTable component */}
      <DataTable data={volumes} columns={columns} onRowClick={handleRowClick} />

      <ConfirmationModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteVolume}
        message="Are you sure you want to delete this volume?"
      />
    </div>
  );
};

export default VolumesPage;
