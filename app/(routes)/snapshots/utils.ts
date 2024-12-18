import { StatusChipVariant } from '@/lib/ui/chips/StatusChips';

export type SnapshotState =
  | 'completed'
  | 'error'
  | 'pending'
  | 'recoverable'
  | 'recovering';

const statusToVariantMap: Record<SnapshotState, StatusChipVariant> = {
  completed: 'success',
  error: 'error',
  pending: 'warning',
  recoverable: 'warning',
  recovering: 'warning',
};

export function mapSnapshotStateToVariant(
  status: SnapshotState
): StatusChipVariant {
  return statusToVariantMap[status];
}
