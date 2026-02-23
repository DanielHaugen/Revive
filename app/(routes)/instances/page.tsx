'use client';

import Copy from '@/lib/ui/icons/Copy';
import Button from '@/lib/ui/buttons/Button';
import StatusChip from '@/lib/ui/chips/StatusChips';
import DataTable, { Column } from '@/lib/ui/tables/DataTable';
import { Instance } from '@aws-sdk/client-ec2';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaFilter, FaCircleExclamation } from 'react-icons/fa6';
import ActionButton from './components/ActionButton';
import { EC2Status, mapEC2StatusToVariant } from './utils';

const REFRESH_INTERVAL_MS = 5 * 1000;

const InstancesPage = () => {
  const [instances, setInstances] = useState<Instance[]>([]); // State to hold instances
  const [loading, setLoading] = useState<boolean>(true); // State to track loading state
  const [error, setError] = useState<string | null>(null); // State to track errors
  const router = useRouter();

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
            onClick={() => {
              fetchInstances();
            }}
          />
        );
      },
    },
  ];

  // Fetch the instances from the API
  const fetchInstances = async () => {
    try {
      const response = await fetch('/api/instances');
      if (!response.ok) {
        throw new Error('Failed to fetch instances');
      }
      const data = await response.json();

      // Exclude the 'createdAt' field from each instance
      const filteredInstances = data.map(({ ...rest }: Instance) => rest);

      setInstances(filteredInstances); // Set the fetched and filtered instances to state
      setError(null); // Clear error when successful
    } catch {
      setError(
        'Failed to fetch data. Please check your AWS credentials.'
      );
    } finally {
      setLoading(false); // Set loading to false once the request is complete
    }
  };

  useEffect(() => {
    fetchInstances(); // Call the function on component mount

    // Set up the interval to fetch instances every `n` seconds (e.g., every 10 seconds)
    const intervalId = setInterval(fetchInstances, REFRESH_INTERVAL_MS); // 10000ms = 10 seconds

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading instances...</div>
      </div>; // Loading message
  }

  if (error) {
    return <div>{error}</div>; // Display error message if there was an error fetching data
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
        <div className="bg-red-900 bg-opacity-30 border border-red-700 rounded-lg p-4 flex items-start gap-3">
          <FaCircleExclamation className="text-red-500 text-lg flex-shrink-0 mt-1" />
          <div>
            <p className="font-semibold text-red-200">AWS Connection Error</p>
            <p className="text-red-300 text-sm">{error}</p>
            <button
              onClick={fetchInstances}
              className="text-red-200 text-sm underline hover:text-red-100 mt-2"
            >
              Configure Credentials
            </button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Instances</h1>
          <p className="text-gray-400 text-sm mt-1">
            {instances.length} Active Resources
          </p>
        </div>
        <Button
          onClick={() => {}}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <FaFilter className="text-sm" />
          Filter
        </Button>
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
