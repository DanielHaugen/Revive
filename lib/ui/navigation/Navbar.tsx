'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowsRotate } from 'react-icons/fa6';
import { useSyncStatus, useTriggerSync, useAutoSync } from '@/lib/hooks/useSync';

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
  const searchRef = useRef<HTMLInputElement>(null);

  useAutoSync();

  // Tick every 5 seconds so formatLastSync is recalculated live between React Query polls.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 5_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-950 text-white p-4 shadow-lg border-b border-gray-800">
      <div className="flex items-center gap-4">
        {/* Logo + Title */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 hover:opacity-80 transition-opacity">
          <Image
            src="/images/revive_logo_cloud.png"
            alt="Revive"
            width={48}
            height={48}
            className="rounded"
          />
          <span className="text-xl font-semibold tracking-tight">Revive</span>
        </Link>

        {/* Centered Search Bar */}
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-lg">
            <input
              ref={searchRef}
              type="text"
              placeholder="Search or go to..."
              className="form-input-sm pr-10"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-500 bg-gray-700 border border-gray-600 rounded px-1.5 py-0.5 font-mono leading-none">
              /
            </kbd>
          </div>
        </div>

        {/* Sync Status + Refresh */}
        <div className="flex items-center gap-3 shrink-0">
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
