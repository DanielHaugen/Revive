'use client';

import { useQuery } from '@tanstack/react-query';
import { Volume } from '@aws-sdk/client-ec2';
import { createQueryFn } from '@/lib/api/query';
import { REFETCH_INTERVAL_DETAIL } from '@/lib/constants/status';

export function useVolumes() {
  return useQuery({
    queryKey: ['volumes'],
    queryFn: createQueryFn<Volume[]>('/api/volumes'),
  });
}

export function useVolume(id: string) {
  return useQuery({
    queryKey: ['volumes', id],
    queryFn: createQueryFn<Volume | null>(`/api/volumes/${id}`),
    refetchInterval: REFETCH_INTERVAL_DETAIL,
    enabled: !!id,
  });
}
