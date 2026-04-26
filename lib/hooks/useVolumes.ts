'use client';

import { useQuery } from '@tanstack/react-query';
import { Volume } from '@aws-sdk/client-ec2';
import { createQueryFn } from '@/lib/api/query';

export function useVolumes() {
  return useQuery({
    queryKey: ['volumes'],
    queryFn: createQueryFn<Volume[]>('/api/volumes'),
  });
}
