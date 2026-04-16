'use client';

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';

type SyncStatus = {
  lastSyncAt: string | null;
  lastError: string | null;
  inProgress: boolean;
};

type SyncConfig = {
  autoSyncEnabled: boolean;
  autoSyncIntervalSecs: number;
};

async function fetchSyncStatus(): Promise<SyncStatus> {
  const res = await fetch('/api/sync');
  if (!res.ok) throw new Error('Failed to fetch sync status');
  return res.json();
}

async function fetchSyncConfig(): Promise<SyncConfig> {
  const res = await fetch('/api/sync/config');
  if (!res.ok) throw new Error('Failed to fetch sync config');
  return res.json();
}

export function useSyncStatus() {
  return useQuery({
    queryKey: ['syncStatus'],
    queryFn: fetchSyncStatus,
    refetchInterval: 10_000,
  });
}

export function useSyncConfig() {
  return useQuery({
    queryKey: ['syncConfig'],
    queryFn: fetchSyncConfig,
    staleTime: 60_000,
  });
}

export function useUpdateSyncConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<SyncConfig>) => {
      const res = await fetch('/api/sync/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update sync config');
      return res.json() as Promise<SyncConfig>;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['syncConfig'], updated);
    },
  });
}

export function useTriggerSync() {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    await fetch('/api/sync', { method: 'POST' });
    // Invalidate everything after sync completes
    await queryClient.invalidateQueries({ queryKey: ['syncStatus'] });
    await queryClient.invalidateQueries({ queryKey: ['instances'] });
    await queryClient.invalidateQueries({ queryKey: ['volumes'] });
    await queryClient.invalidateQueries({ queryKey: ['snapshots'] });
  }, [queryClient]);
}

/**
 * Drives periodic auto-sync based on the stored configuration.
 * Mount this once in a top-level component (e.g. Navbar).
 */
export function useAutoSync() {
  const { data: syncStatus } = useSyncStatus();
  const { data: syncConfig } = useSyncConfig();
  const triggerSync = useTriggerSync();

  // Keep stable refs so interval callbacks always see the latest values
  // without being listed as effect dependencies (which would reset the timer).
  const triggerRef = useRef(triggerSync);
  useEffect(() => {
    triggerRef.current = triggerSync;
  }, [triggerSync]);

  const syncStatusRef = useRef(syncStatus);
  useEffect(() => {
    syncStatusRef.current = syncStatus;
  }, [syncStatus]);

  useEffect(() => {
    if (!syncConfig?.autoSyncEnabled) return;

    const intervalMs = (syncConfig.autoSyncIntervalSecs ?? 30) * 1000;

    const id = setInterval(() => {
      if (!syncStatusRef.current?.inProgress) {
        triggerRef.current();
      }
    }, intervalMs);

    return () => clearInterval(id);
    // Only reset the interval when the config itself changes, not on every status poll.
  }, [syncConfig?.autoSyncEnabled, syncConfig?.autoSyncIntervalSecs]);
}

