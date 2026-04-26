'use client';

import { useQuery } from '@tanstack/react-query';
import { Playbook } from '@prisma/client';
import { createQueryFn } from '@/lib/api/query';
import type { PlaybookWithDetails } from '@/lib/types';

export function usePlaybooks() {
  return useQuery({
    queryKey: ['playbooks'],
    queryFn: createQueryFn<Playbook[]>('/api/playbooks'),
  });
}

export function usePlaybook(id: number) {
  return useQuery({
    queryKey: ['playbooks', id],
    queryFn: async () => {
      const data = await createQueryFn<{ playbook: PlaybookWithDetails | null }>(`/api/playbooks/${id}`)();
      return data.playbook ?? null;
    },
    enabled: id > 0,
  });
}
