import { StatusChipVariant } from '@/lib/ui/chips/StatusChips';

// --- Refetch intervals (ms) ---

export const REFETCH_INTERVAL_LIST = 5_000;
export const REFETCH_INTERVAL_DETAIL = 10_000;

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

export const EC2_STATUS_OPTIONS: EC2Status[] = [
  'running', 'stopped', 'stopping', 'pending', 'terminated', 'shutting-down',
];

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

export const SNAPSHOT_STATUS_OPTIONS: SnapshotState[] = [
  'completed', 'pending', 'error', 'recoverable', 'recovering',
];

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

export const VOLUME_STATUS_OPTIONS: VolumeState[] = [
  'available', 'in-use', 'creating', 'deleting', 'deleted', 'error',
];

// --- Volume types ---

export const VOLUME_TYPE_VALUES = ['gp2', 'gp3', 'io1', 'io2', 'st1', 'sc1', 'standard'] as const;
export type VolumeType = typeof VOLUME_TYPE_VALUES[number];
