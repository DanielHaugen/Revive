'use client';

import Card from '@/lib/ui/card/Card';
import Button from '@/ui/buttons/Button';
import SearchDropdown from '@/ui/inputs/SearchableDropdown';
import { Instance, Snapshot } from '@aws-sdk/client-ec2';
import { useEffect, useState } from 'react';
import { FaRotateRight } from 'react-icons/fa6';
import { toast } from 'react-toastify';

const RestorationPage = () => {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');
  const [isRestoring, setIsRestoring] = useState<boolean>(false);

  // Fetch available instances on mount
  useEffect(() => {
    const fetchInstances = async () => {
      try {
        const response = await fetch('/api/instances');
        if (!response.ok) throw new Error('Failed to fetch instances');
        const data = await response.json();
        setInstances(data);
      } catch (error) {
        console.error('Error fetching instances:', error);
        toast.error('Error fetching instances');
      }
    };
    fetchInstances();
  }, []);

  // Fetch snapshots when an instance is selected
  useEffect(() => {
    if (!selectedInstance) return;

    const fetchSnapshots = async () => {
      try {
        const response = await fetch(
          `/api/snapshots?instanceId=${selectedInstance}`
        );
        if (!response.ok) throw new Error('Failed to fetch snapshots');
        const data = await response.json();
        setSnapshots(data);
      } catch (error) {
        console.error('Error fetching snapshots:', error);
        toast.error('Error fetching snapshots');
      }
    };
    fetchSnapshots();
  }, [selectedInstance]);

  // Handle the restore button click
  const handleRestore = () => {
    if (!selectedInstance || !selectedSnapshot) return;

    setProgress(''); // Clear previous progress
    setIsRestoring(true);
    toast.info('Starting restoration process...');

    const eventSource = new EventSource(
      `/api/instances/${selectedInstance}/restore/${selectedSnapshot}`
    );

    // Handle incoming messages
    eventSource.onmessage = (event) => {
      //   console.log(eventSource);
      if (event.data === 'DONE') {
        // Close the connection when restoration is complete
        eventSource.close();
        setIsRestoring(false);
        toast.success('Restoration process completed.');
      } else {
        // Append progress messages
        setProgress((prev) => `${prev}\n${event.data}`);
      }
    };

    // Handle errors and connection closure
    eventSource.onerror = (error) => {
      if (
        error.target instanceof EventSource &&
        error.target.readyState === EventSource.CLOSED
      ) {
        // This is a normal close event, so no action needed
        console.log('SSE connection closed gracefully.');
        toast.success('Restoration process completed.');
      } else {
        // Handle unexpected errors
        console.error('SSE connection error:', error);

        toast.error('Error during restoration process.');
      }
      setIsRestoring(false);
      eventSource.close(); // Always close the connection
    };
  };

  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-semibold mb-6">EC2 Restorations</h1>

      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-x-8 gap-y-2">
        <Card className="grid grid-cols-1 3xl:grid-cols-2 gap-4">
          <h1 className="text-xl font-semibold">New Restoration</h1>
          {/* Instance Dropdown */}
          <div>
            <label className="block mb-2 font-medium">Select Instance</label>
            <SearchDropdown
              options={instances.map(
                ({ InstanceId, Tags, PrivateIpAddress }) => ({
                  value: InstanceId ?? '',
                  label: `${
                    Tags?.find((tag) => tag.Key === 'Name')?.Value || 'Unnamed'
                  } (${InstanceId}) [${PrivateIpAddress}]`,
                })
              )}
              onChange={(option) => {
                setSelectedInstance(option.value);
                setSnapshots([]); // Reset snapshots on instance change
                setSelectedSnapshot(null);
              }}
              placeholder="Select an instance..."
            />
          </div>

          {/* Snapshot Dropdown */}
          {selectedInstance && (
            <div>
              <label className="block mb-2 font-medium">Select Snapshot</label>
              <SearchDropdown
                options={snapshots.map(
                  ({ SnapshotId, CompletionTime, Tags }) => ({
                    value: SnapshotId ?? '',
                    label: `${
                      Tags && Tags.find((t) => t.Key == 'Name')
                        ? Tags.find((t) => t.Key == 'Name')?.Value
                        : SnapshotId
                    } - Taken on ${CompletionTime}`,
                  })
                )}
                onChange={(option) => setSelectedSnapshot(option.value)}
                placeholder="Select a snapshot..."
              />
            </div>
          )}

          {/* Restore Button */}
          <Button
            onClick={handleRestore}
            disabled={!selectedInstance || !selectedSnapshot || isRestoring}
            className="flex items-center justify-center"
          >
            {isRestoring ? (
              <div className="animate-spin mr-2">
                <FaRotateRight />
              </div>
            ) : (
              <FaRotateRight className="mr-2 transition duration-300 ease-in-out transform hover:rotate-180" />
            )}
            {isRestoring ? 'Restoring...' : 'Restore Instance'}
          </Button>
        </Card>

        <Card>
          <h1 className="text-xl font-semibold">Recent Restorations</h1>
        </Card>
      </div>

      {/* Progress Output */}
      {progress && (
        <Card className="col-span-1 2xl:col-span-2 p-4">
          <h2 className="text-lg font-semibold mb-2">Progress</h2>
          <pre className="whitespace-pre-wrap text-sm text-gray-700">
            {progress.trim()}
          </pre>
        </Card>
      )}
    </div>
  );
};

export default RestorationPage;
