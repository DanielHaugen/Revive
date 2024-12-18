'use client';

import Copy from '@/lib/ui/icons/Copy';
import Button from '@/ui/buttons/Button';
import StatusChip from '@/ui/chips/StatusChips';
import DataTable, { Column } from '@/ui/tables/DataTable';
import { Instance } from '@aws-sdk/client-ec2';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaFilter } from 'react-icons/fa6';
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
      header: 'Name',
      accessor: (item) => {
        const nameTag = item.Tags?.find((tag) => tag.Key === 'Name');
        return nameTag ? nameTag.Value : 'Unnamed Instance';
      },
      render: (value) => <span>{value as string}</span>, // This works fine
    },
    { header: 'OS', accessor: 'PlatformDetails' }, // Direct key access
    {
      header: 'Private IPv4',
      accessor: 'PrivateIpAddress',
      render: (value) => (
        <Copy value={value as string} title="Private IP Address" />
      ),
    },
    {
      header: 'Status',
      accessor: (item) => item.State?.Name || 'Unknown',
      render: (value, item) => {
        return (
          <StatusChip
            variant={mapEC2StatusToVariant(value as EC2Status)}
            label={value as EC2Status}
          />
        );
      },
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
    } catch (err) {
      setError(
        'Error fetching instances: ' +
          (err instanceof Error ? err.message : 'Unknown error')
      );
    } finally {
      setLoading(false); // Set loading to false once the request is complete
      console.log(instances);
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
    return <div>Loading instances...</div>; // Loading message
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
    <div className="container mx-auto py-4">
      <div className="flex mb-4">
        <h1 className="text-2xl font-semibold">EC2 Instances</h1>
        <Button onClick={() => {}} className="ml-auto">
          <div className="flex items-center">
            Filter <FaFilter className="ml-3" />
          </div>
        </Button>
      </div>
      {/* Pass the instances and columns to the DataTable component */}
      <DataTable
        data={instances}
        columns={columns}
        onRowClick={handleRowClick}
      />
    </div>
  );
};

export default InstancesPage;
