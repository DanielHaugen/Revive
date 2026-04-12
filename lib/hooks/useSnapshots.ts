'use client';

import { useQuery } from '@tanstack/react-query';
import { Snapshot } from '@aws-sdk/client-ec2';

async function fetchSnapshots(): Promise<Snapshot[]> {
  const res = await fetch('/api/snapshots');
  if (!res.ok) throw new Error('Failed to fetch snapshots');
  return res.json();
}

async function fetchSnapshot(id: string): Promise<Snapshot | null> {
  const res = await fetch(`/api/snapshots/${id}`);
  if (!res.ok) throw new Error('Failed to fetch snapshot');
  return res.json();
}

export function useSnapshots() {
  return useQuery({
    queryKey: ['snapshots'],
    queryFn: fetchSnapshots,
  });
}

export function useSnapshot(id: string) {
  return useQuery({
    queryKey: ['snapshots', id],
    queryFn: () => fetchSnapshot(id),
    refetchInterval: 10_000,
    enabled: !!id,
  });
}
