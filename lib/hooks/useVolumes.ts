'use client';

import { useQuery } from '@tanstack/react-query';
import { Volume } from '@aws-sdk/client-ec2';

async function fetchVolumes(): Promise<Volume[]> {
  const res = await fetch('/api/volumes');
  if (!res.ok) throw new Error('Failed to fetch volumes');
  return res.json();
}

export function useVolumes() {
  return useQuery({
    queryKey: ['volumes'],
    queryFn: fetchVolumes,
  });
}
