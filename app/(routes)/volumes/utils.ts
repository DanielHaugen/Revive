import { StatusChipVariant } from '@/lib/ui/chips/StatusChips';

export type VolumeState =
  | 'available'
  | 'creating'
  | 'deleted'
  | 'deleting'
  | 'error'
  | 'in-use';

const statusToVariantMap: Record<VolumeState, StatusChipVariant> = {
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
  return statusToVariantMap[status];
}
