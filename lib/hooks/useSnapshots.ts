'use client';

import { useQuery } from '@tanstack/react-query';
import { Snapshot } from '@aws-sdk/client-ec2';
import { createQueryFn } from '@/lib/api/query';
import { REFETCH_INTERVAL_DETAIL } from '@/lib/constants/status';

export function useSnapshots() {
  return useQuery({
    queryKey: ['snapshots'],
    queryFn: createQueryFn<Snapshot[]>('/api/snapshots'),
  });
}

export function useSnapshot(id: string) {
  return useQuery({
    queryKey: ['snapshots', id],
    queryFn: createQueryFn<Snapshot | null>(`/api/snapshots/${id}`),
    refetchInterval: REFETCH_INTERVAL_DETAIL,
    enabled: !!id,
  });
}
