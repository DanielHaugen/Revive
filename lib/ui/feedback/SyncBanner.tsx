'use client';

import { useSyncStatus, useTriggerSync } from '@/lib/hooks/useSync';
import { FaTriangleExclamation } from 'react-icons/fa6';

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
      <div className="bg-red-900 bg-opacity-40 border-b border-red-700 px-6 py-2 flex items-center gap-2 text-sm">
        <FaTriangleExclamation className="text-red-400 flex-shrink-0" />
        <span className="text-red-300">
          AWS sync failed: {syncStatus.lastError}
        </span>
        <button
          onClick={triggerSync}
          className="ml-auto text-red-200 underline hover:text-red-100 text-xs"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isStale) {
    return (
      <div className="bg-yellow-900 bg-opacity-30 border-b border-yellow-700 px-6 py-2 flex items-center gap-2 text-sm">
        <FaTriangleExclamation className="text-yellow-400 flex-shrink-0" />
        <span className="text-yellow-300">
          Data may be outdated — last synced more than 5 minutes ago.
        </span>
        <button
          onClick={triggerSync}
          className="ml-auto text-yellow-200 underline hover:text-yellow-100 text-xs"
        >
          Sync now
        </button>
      </div>
    );
  }

  return null;
}
