'use client';

import { useQuery } from '@tanstack/react-query';
import { Instance } from '@aws-sdk/client-ec2';

async function fetchInstances(): Promise<Instance[]> {
  const res = await fetch('/api/instances');
  if (!res.ok) throw new Error('Failed to fetch instances');
  return res.json();
}

async function fetchInstance(id: string): Promise<Instance | null> {
  const res = await fetch(`/api/instances/${id}`);
  if (!res.ok) throw new Error('Failed to fetch instance');
  return res.json();
}

export function useInstances() {
  return useQuery({
    queryKey: ['instances'],
    queryFn: fetchInstances,
    refetchInterval: 5_000,
  });
}

export function useInstance(id: string) {
  return useQuery({
    queryKey: ['instances', id],
    queryFn: () => fetchInstance(id),
    refetchInterval: 10_000,
    enabled: !!id,
  });
}
