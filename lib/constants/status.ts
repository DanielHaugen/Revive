import { StatusChipVariant } from '@/lib/ui/chips/StatusChips';

// --- EC2 Instance statuses ---

export type EC2Status =
  | 'running'
  | 'stopped'
  | 'stopping'
  | 'terminated'
  | 'pending'
  | 'shutting-down';

const ec2StatusMap: Record<EC2Status, StatusChipVariant> = {
  running: 'success',
  stopped: 'error',
  stopping: 'warning',
  terminated: 'error',
  pending: 'warning',
  'shutting-down': 'warning',
};

export function mapEC2StatusToVariant(status: EC2Status): StatusChipVariant {
  return ec2StatusMap[status];
}

// --- Snapshot statuses ---

export type SnapshotState =
  | 'completed'
  | 'error'
  | 'pending'
  | 'recoverable'
  | 'recovering';

const snapshotStatusMap: Record<SnapshotState, StatusChipVariant> = {
  completed: 'success',
  error: 'error',
  pending: 'warning',
  recoverable: 'warning',
  recovering: 'warning',
};

export function mapSnapshotStateToVariant(
  status: SnapshotState
): StatusChipVariant {
  return snapshotStatusMap[status];
}

// --- Volume statuses ---

export type VolumeState =
  | 'available'
  | 'creating'
  | 'deleted'
  | 'deleting'
  | 'error'
  | 'in-use';

const volumeStatusMap: Record<VolumeState, StatusChipVariant> = {
  available: 'success',
  creating: 'warning',
  deleted: 'secondary',
  deleting: 'warning',
  error: 'error',
  'in-use': 'info',
};

export function mapVolumeStateToVariant(
  status: VolumeState
): StatusChipVariant {
  return volumeStatusMap[status];
}
