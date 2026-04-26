'use client';

import { useState } from 'react';
import Button from '@/lib/ui/buttons/Button';
import Modal from '@/lib/ui/modals/Modal';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';

const VOLUME_TYPES = [
  { value: 'gp3', label: 'General Purpose SSD (gp3)' },
  { value: 'gp2', label: 'General Purpose SSD (gp2)' },
  { value: 'io1', label: 'Provisioned IOPS SSD (io1)' },
  { value: 'io2', label: 'Provisioned IOPS SSD (io2)' },
  { value: 'st1', label: 'Throughput Optimized HDD (st1)' },
  { value: 'sc1', label: 'Cold HDD (sc1)' },
  { value: 'standard', label: 'Magnetic (standard)' },
];

type CreateVolumeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  availabilityZones: string[];
};

export default function CreateVolumeModal({
  isOpen,
  onClose,
  availabilityZones,
}: CreateVolumeModalProps) {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    availabilityZone: '',
    size: 8,
    volumeType: 'gp3',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/volumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availabilityZone: form.availabilityZone,
          size: form.size,
          volumeType: form.volumeType,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create volume');
      }

      toast.success('Volume created successfully!');
      queryClient.invalidateQueries({ queryKey: ['volumes'] });
      onClose();
      setForm({ availabilityZone: '', size: 8, volumeType: 'gp3' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create volume');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">Create EBS Volume</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Availability Zone
            </label>
            <select
              required
              value={form.availabilityZone}
              onChange={(e) =>
                setForm((f) => ({ ...f, availabilityZone: e.target.value }))
              }
              className="form-input-sm"
            >
              <option value="">Select zone...</option>
              {availabilityZones.map((az) => (
                <option key={az} value={az}>
                  {az}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Size (GB)
            </label>
            <input
              type="number"
              required
              min={1}
              max={16384}
              value={form.size}
              onChange={(e) =>
                setForm((f) => ({ ...f, size: parseInt(e.target.value) || 1 }))
              }
              className="form-input-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Volume Type
            </label>
            <select
              value={form.volumeType}
              onChange={(e) =>
                setForm((f) => ({ ...f, volumeType: e.target.value }))
              }
              className="form-input-sm"
            >
              {VOLUME_TYPES.map((vt) => (
                <option key={vt.value} value={vt.value}>
                  {vt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              onClick={onClose}
              variant="secondary"
              ariaLabel="Cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {}}
              variant="primary"
              ariaLabel="Create Volume"
              disabled={submitting || !form.availabilityZone}
            >
              {submitting ? 'Creating...' : 'Create Volume'}
            </Button>
          </div>
        </form>
    </Modal>
  );
}
