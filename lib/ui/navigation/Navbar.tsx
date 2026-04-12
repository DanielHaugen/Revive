'use client';

import { FaArrowsRotate } from 'react-icons/fa6';
import { useSyncStatus, useTriggerSync } from '@/lib/hooks/useSync';

function formatLastSync(lastSyncAt: string | null): string {
  if (!lastSyncAt) return 'Never synced';
  const seconds = Math.round((Date.now() - new Date(lastSyncAt).getTime()) / 1000);
  if (seconds < 5) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.round(minutes / 60)}h ago`;
}

export default function Navbar() {
  const { data: syncStatus } = useSyncStatus();
  const triggerSync = useTriggerSync();

  return (
    <header className="bg-gray-900 text-white p-4 shadow-lg border-b border-gray-800">
      <div className="flex items-center justify-between gap-4">
        {/* Spacer for sidebar */}
        <div className="w-0"></div>

        {/* Page Title and Search */}
        <div className="flex items-center justify-between flex-1 gap-6">
          <h1 className="text-2xl font-semibold">Revive</h1>

          {/* Search Bar */}
          <div className="flex-1 flex justify-center max-w-md">
            <input
              type="text"
              placeholder="Search resources..."
              className="form-input"
            />
          </div>
        </div>

        {/* Sync Status + Refresh */}
        <div className="flex items-center gap-3">
          {syncStatus && (
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {syncStatus.lastError
                ? 'Sync error'
                : `Synced ${formatLastSync(syncStatus.lastSyncAt)}`}
            </span>
          )}
          <button
            onClick={triggerSync}
            disabled={syncStatus?.inProgress}
            className="p-2 hover:bg-gray-800 rounded-lg transition disabled:opacity-50"
            title="Sync AWS resources"
          >
            <FaArrowsRotate
              className={`text-xl ${syncStatus?.inProgress ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
