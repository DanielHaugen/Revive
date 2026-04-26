'use client';

import Button from '@/lib/ui/buttons/Button';
import Modal from '@/lib/ui/modals/Modal';
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
    <Modal isOpen={true} onClose={onClose}>
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
        <Button
          onClick={handleLink}
          variant="success"
          disabled={loading || !selectedInstance}
        >
          Link
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
};

export default LinkSnapshotModal;
