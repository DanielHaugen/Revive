'use client';

import { useQuery } from '@tanstack/react-query';
import { Playbook } from '@prisma/client';

type PlaybookWithSteps = Playbook & {
  steps: {
    id: number;
    type: string;
    targets: {
      id: number;
      instanceId: string;
      instanceName: string | null;
      availabilityZone: string | null;
      snapshotId: string | null;
      snapshotName: string | null;
    }[];
  }[];
};

async function fetchPlaybooks(): Promise<Playbook[]> {
  const res = await fetch('/api/playbooks');
  if (!res.ok) throw new Error('Failed to fetch playbooks');
  return res.json();
}

async function fetchPlaybook(id: number): Promise<PlaybookWithSteps | null> {
  const res = await fetch(`/api/playbooks/${id}`);
  if (!res.ok) throw new Error('Failed to fetch playbook');
  const data = await res.json();
  return data.playbook ?? null;
}

export function usePlaybooks() {
  return useQuery({
    queryKey: ['playbooks'],
    queryFn: fetchPlaybooks,
  });
}

export function usePlaybook(id: number) {
  return useQuery({
    queryKey: ['playbooks', id],
    queryFn: () => fetchPlaybook(id),
    enabled: id > 0,
  });
}
