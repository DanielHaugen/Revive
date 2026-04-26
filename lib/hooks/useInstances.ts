'use client';

import { useQuery } from '@tanstack/react-query';
import { Instance } from '@aws-sdk/client-ec2';
import { createQueryFn } from '@/lib/api/query';
import { REFETCH_INTERVAL_LIST, REFETCH_INTERVAL_DETAIL } from '@/lib/constants/status';

export function useInstances() {
  return useQuery({
    queryKey: ['instances'],
    queryFn: createQueryFn<Instance[]>('/api/instances'),
    refetchInterval: REFETCH_INTERVAL_LIST,
  });
}

export function useInstance(id: string) {
  return useQuery({
    queryKey: ['instances', id],
    queryFn: createQueryFn<Instance | null>(`/api/instances/${id}`),
    refetchInterval: REFETCH_INTERVAL_DETAIL,
    enabled: !!id,
  });
}
