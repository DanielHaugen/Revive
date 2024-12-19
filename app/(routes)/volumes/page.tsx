'use client';

import Copy from '@/lib/ui/icons/Copy';
import Button from '@/ui/buttons/Button';
import StatusChip from '@/ui/chips/StatusChips';
import DataTable, { Column } from '@/ui/tables/DataTable';
import { Volume } from '@aws-sdk/client-ec2';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaFilter, FaTrash } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import { VolumeState, mapVolumeStateToVariant } from './utils';

const VolumesPage = () => {
  const [volumes, setVolumes] = useState<Volume[]>([]); // State to hold volumes
  const [loading, setLoading] = useState<boolean>(true); // State to track loading state
  const [error, setError] = useState<string | null>(null); // State to track errors
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
        console.log(item);
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

  useEffect(() => {
    // Fetch the volumes from the API
    const fetchVolumes = async () => {
      try {
        const response = await fetch('/api/volumes');
        if (!response.ok) {
          throw new Error('Failed to fetch volumes');
        }
        const data = await response.json();

        // Exclude the 'createdAt' field from each instance
        const filteredVolumes = data.map(({ ...rest }: Volume) => rest);

        setVolumes(filteredVolumes); // Set the fetched and filtered volumes to state
      } catch (err) {
        setError(
          'Error fetching volumes: ' +
            (err instanceof Error ? err.message : 'Unknown error')
        );
      } finally {
        setLoading(false); // Set loading to false once the request is complete
        console.log(volumes);
      }
    };

    fetchVolumes(); // Call the function on component mount
  }, []);

  if (loading) {
    return <div>Loading volumes...</div>; // Loading message
  }

  if (error) {
    return <div>{error}</div>; // Display error message if there was an error fetching data
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
    if (
      volumeId.trim().length == 0 ||
      !confirm('Are you sure you want to delete this Volume?')
    )
      return;

    try {
      const response = await fetch(`/api/volumes/${volumeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setVolumes((prev) => prev.filter((v) => v.VolumeId !== volumeId));
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
        <Button onClick={() => {}} className="ml-auto">
          <div className="flex items-center">
            Filter <FaFilter className="ml-3" />
          </div>
        </Button>
      </div>
      {/* Pass the volumes and columns to the DataTable component */}
      <DataTable data={volumes} columns={columns} onRowClick={handleRowClick} />
    </div>
  );
};

export default VolumesPage;
