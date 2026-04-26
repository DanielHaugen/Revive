'use client';

import { useSyncStatus, useTriggerSync } from '@/lib/hooks/useSync';
import { FaTriangleExclamation } from 'react-icons/fa6';
import Banner from '@/lib/ui/feedback/Banner';

const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

export default function SyncBanner() {
  const { data: syncStatus } = useSyncStatus();
  const triggerSync = useTriggerSync();

  if (!syncStatus) return null;

  const isStale =
    syncStatus.lastSyncAt &&
    Date.now() - new Date(syncStatus.lastSyncAt).getTime() > STALE_THRESHOLD_MS;

  if (syncStatus.lastError) {
    return (
      <Banner
        variant="error"
        icon={<FaTriangleExclamation className="text-red-400 flex-shrink-0" />}
        onAction={triggerSync}
        actionLabel="Retry"
        topBar
      >
        AWS sync failed: {syncStatus.lastError}
      </Banner>
    );
  }

  if (isStale) {
    return (
      <Banner
        variant="warning"
        icon={<FaTriangleExclamation className="text-yellow-400 flex-shrink-0" />}
        onAction={triggerSync}
        actionLabel="Sync now"
        topBar
      >
        Data may be outdated — last synced more than 5 minutes ago.
      </Banner>
    );
  }

  return null;
}
