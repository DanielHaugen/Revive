'use client';

import PrimaryButton from '@/ui/buttons/PrimaryButton';
import StatusChip, { EC2Status } from '@/ui/chips/StatusChips';
import ConfirmationModal from '@/ui/modals/ConfirmationModal';
import DataTable, { Column } from '@/ui/tables/DataTable';
import { Instance } from '@aws-sdk/client-ec2';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaFilter, FaPowerOff } from 'react-icons/fa6';
import { startInstance, stopInstance } from './api';

const REFRESH_INTERVAL_MS = 3 * 1000;

// Use the type guard in the render function
const columns: Column<Instance>[] = [
  {
    header: 'Name',
    accessor: (item) => {
      const nameTag = item.Tags?.find((tag) => tag.Key === 'Name');
      return nameTag ? nameTag.Value : 'Unnamed Instance';
    },
    render: (value) => <span>{value as string}</span>, // This works fine
  },
  { header: 'OS', accessor: 'PlatformDetails' }, // Direct key access
  { header: 'IPv4', accessor: 'PrivateIpAddress' },
  {
    header: 'Status',
    accessor: (item) => item.State?.Name || 'Unknown',
    render: (value, item) => {
      return <StatusChip status={value as EC2Status} />;
    },
  },
  {
    header: 'Actions',
    accessor: (item) => item as React.ReactNode,
    render: (value) => {
      const instance = value as Instance;
      // Track loading states
      const [isTransitioning, setIsTransitioning] = useState(false);

      const handleStart = async () => {
        setIsTransitioning(true);
        try {
          // Call your API to start the instance
          await startInstance(instance.InstanceId as string); // Replace with your API call

          // Optionally update the status in the instance object if needed
        } catch (error) {
          console.error('Error starting instance', error);
        } finally {
          setIsTransitioning(false);
        }
      };

      const handleStop = async () => {
        setIsTransitioning(true);
        try {
          // Call your API to stop the instance
          await stopInstance(instance.InstanceId as string); // Replace with your API call
          // Optionally update the status in the instance object if needed
        } catch (error) {
          console.error('Error stopping instance', error);
        } finally {
          setIsTransitioning(false);
        }
      };

      const showStartButton = instance.State?.Name !== 'running';
      const isInstanceInTransition =
        instance.State?.Name === 'pending' ||
        instance.State?.Name === 'stopping';
      return (
        <div className="flex gap-2">
          <PrimaryButton
            onClick={showStartButton ? handleStart : handleStop}
            ariaLabel={`${showStartButton ? 'Start' : 'Stop'} Instance`}
            className="flex items-center justify-center"
            disabled={isTransitioning || isInstanceInTransition}
          >
            <FaPowerOff className="text-white-600 mr-2" />
            {showStartButton ? 'Start' : 'Stop'}
          </PrimaryButton>
        </div>
      );
    },
  },
];

const InstancesPage = () => {
  const [instances, setInstances] = useState<Instance[]>([]); // State to hold instances
  const [selectedInstance, setSelectedInstance] = useState<null | Instance>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true); // State to track loading state
  const [error, setError] = useState<string | null>(null); // State to track errors
  const [isModalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
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

  // Function to handle instance deletion
  const handleDeleteInstance = (instance: Instance) => {
    setSelectedInstance(instance);
    setModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedInstance) {
      // Simulate instance deletion
      setInstances((prevInstances) =>
        prevInstances.filter(
          (instance) => instance.InstanceId !== selectedInstance.InstanceId
        )
      );
      setModalOpen(false);
      setSelectedInstance(null);
    }
  };

  const cancelDelete = () => {
    setModalOpen(false);
    setSelectedInstance(null);
  };

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
        <PrimaryButton onClick={() => {}} className="ml-auto">
          <div className="flex items-center">
            Filter <FaFilter className="ml-3" />
          </div>
        </PrimaryButton>
      </div>
      {/* Pass the instances and columns to the DataTable component */}
      <DataTable
        data={instances}
        columns={columns}
        onRowClick={handleRowClick}
      />

      {/* Button to trigger the deletion of an instance */}
      <div className="mt-4">
        <PrimaryButton onClick={() => handleDeleteInstance(instances[0])}>
          Delete First Instance
        </PrimaryButton>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        message={`Are you sure you want to delete instance "${selectedInstance?.InstanceId}"?`}
      />
    </div>
  );
};

export default InstancesPage;
