'use client';

import SearchableDropdown, { Option } from '@/lib/ui/inputs/SearchableDropdown';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

type LinkSnapshotModalProps = {
  snapshotId: string;
  onClose: () => void;
};

const LinkSnapshotModal: React.FC<LinkSnapshotModalProps> = ({
  snapshotId,
  onClose,
}) => {
  const [ec2Instances, setEc2Instances] = useState<Option[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<Option | null>(null);
  const [snapshotName, setSnapshotName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInstances = async () => {
      try {
        const response = await fetch('/api/instances'); // Adjust API endpoint as needed
        if (!response.ok) throw new Error('Failed to fetch EC2 instances');

        const data = await response.json();
        const options = data.map(
          (instance: {
            InstanceId: string;
            Tags: { Key: string; Value: string }[];
          }) => ({
            value: instance.InstanceId,
            label: `${instance.Tags.find((t) => t.Key === 'Name')?.Value} (${
              instance.InstanceId
            })`,
          })
        );
        setEc2Instances(options);
      } catch (error) {
        console.error('Error fetching EC2 instances:', error);
      }
    };

    fetchInstances();
  }, []);

  const handleLink = async () => {
    const name = snapshotName.trim();
    if (!selectedInstance || name.length === 0) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/snapshots/${snapshotId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tags: [
            { Key: 'InstanceId', Value: selectedInstance.value },
            { Key: 'Name', Value: name },
          ],
        }),
      });
      if (!response.ok) throw new Error('Failed to link snapshot to instance');

      toast.success('Snapshot successfully linked to EC2 instance!');
      onClose();
    } catch (error) {
      console.error('Error linking snapshot:', error);
      toast.error('Failed to link snapshot to EC2 instance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg shadow-lg max-w-md w-full text-gray-100">
        <h2 className="text-xl font-bold mb-4">
          Link Snapshot to EC2 Instance
        </h2>
        <SearchableDropdown
          options={ec2Instances}
          onChange={setSelectedInstance}
          placeholder="Select EC2 instance..."
        />

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-400">
            Snapshot Name
          </label>
          <input
            type="text"
            value={snapshotName}
            onChange={(e) => setSnapshotName(e.target.value)}
            className="form-input mt-1"
            placeholder="Enter snapshot name..."
            required
          />
        </div>

        <div className="flex space-x-4 mt-4">
          <button
            onClick={handleLink}
            className="px-4 py-2 bg-green-500 text-white rounded-lg"
            disabled={loading || !selectedInstance}
          >
            Link
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkSnapshotModal;
