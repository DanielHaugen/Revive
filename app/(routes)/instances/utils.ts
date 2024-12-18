import { StatusChipVariant } from '@/lib/ui/chips/StatusChips';

export type EC2Status =
  | 'running'
  | 'stopped'
  | 'stopping'
  | 'terminated'
  | 'pending'
  | 'shutting-down';

const statusToVariantMap: Record<EC2Status, StatusChipVariant> = {
  running: 'success',
  stopped: 'error',
  stopping: 'warning',
  terminated: 'error',
  pending: 'warning',
  'shutting-down': 'warning',
};

export function mapEC2StatusToVariant(status: EC2Status): StatusChipVariant {
  return statusToVariantMap[status];
}
