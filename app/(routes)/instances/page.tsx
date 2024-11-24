'use client';

import PrimaryButton from '@/ui/buttons/PrimaryButton';
import StatusChip from '@/ui/chips/StatusChips';
import ConfirmationModal from '@/ui/modals/ConfirmationModal';
import DataTable from '@/ui/tables/DataTable';
import { Instance } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Define the EC2Instance type
type EC2Instance = {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'stopped' | 'terminated' | 'pending';
};

// Define a type for columns
type Column<T> = {
  header: string;
  accessor: keyof T;
  render?: (value: T[keyof T]) => React.ReactNode;
};

// Type guard to check if a value is a valid EC2 status
const isValidStatus = (
  value: string
): value is 'running' | 'stopped' | 'terminated' | 'pending' => {
  return ['running', 'stopped', 'terminated', 'pending'].includes(value);
};

// Use the type guard in the render function
const columns: Column<EC2Instance>[] = [
  { header: 'ID', accessor: 'id' },
  { header: 'Name', accessor: 'name' },
  { header: 'Type', accessor: 'type' },
  {
    header: 'Status',
    accessor: 'status',
    render: (value: string) => {
      if (isValidStatus(value)) {
        return <StatusChip status={value} />;
      }
      return <span>Unknown Status</span>;
    },
  },
];

const InstancesPage = () => {
  const [instances, setInstances] = useState<EC2Instance[]>([]); // State to hold instances
  const [selectedInstance, setSelectedInstance] = useState<null | {
    id: string;
    name: string;
  }>(null);
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
        const filteredInstances = data.map(
          ({ createdAt, ...rest }: Instance) => rest
        );

        setInstances(filteredInstances); // Set the fetched and filtered instances to state
      } catch (err) {
        setError(
          'Error fetching instances: ' +
            (err instanceof Error ? err.message : 'Unknown error')
        );
      } finally {
        setLoading(false); // Set loading to false once the request is complete
      }
    };

    fetchInstances(); // Call the function on component mount
  }, []);

  if (loading) {
    return <div>Loading instances...</div>; // Loading message
  }

  if (error) {
    return <div>{error}</div>; // Display error message if there was an error fetching data
  }

  // Function to handle instance deletion
  const handleDeleteInstance = (instance: { id: string; name: string }) => {
    setSelectedInstance(instance);
    setModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedInstance) {
      // Simulate instance deletion
      setInstances((prevInstances) =>
        prevInstances.filter((instance) => instance.id !== selectedInstance.id)
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
  const handleRowClick = (instance: EC2Instance) => {
    router.push(`/instances/${instance.id}`); // Navigate to the instance page
  };

  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-semibold mb-4">EC2 Instances</h1>
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
        message={`Are you sure you want to delete instance "${selectedInstance?.name}"?`}
      />
    </div>
  );
};

export default InstancesPage;
