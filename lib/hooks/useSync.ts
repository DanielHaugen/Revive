'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

type SyncStatus = {
  lastSyncAt: string | null;
  lastError: string | null;
  inProgress: boolean;
};

async function fetchSyncStatus(): Promise<SyncStatus> {
  const res = await fetch('/api/sync');
  if (!res.ok) throw new Error('Failed to fetch sync status');
  return res.json();
}

export function useSyncStatus() {
  return useQuery({
    queryKey: ['syncStatus'],
    queryFn: fetchSyncStatus,
    refetchInterval: 10_000,
  });
}

export function useTriggerSync() {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    await fetch('/api/sync', { method: 'POST' });
    // Invalidate everything after sync completes
    queryClient.invalidateQueries({ queryKey: ['syncStatus'] });
    queryClient.invalidateQueries({ queryKey: ['instances'] });
    queryClient.invalidateQueries({ queryKey: ['volumes'] });
    queryClient.invalidateQueries({ queryKey: ['snapshots'] });
  }, [queryClient]);
}
