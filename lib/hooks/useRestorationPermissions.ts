import { useQuery } from '@tanstack/react-query';
import type { PermissionsCheckResponse } from '@/app/api/restoration/permissions/route';

export type { PermissionsCheckResponse };

export type DryRunCheckResponse = {
  instanceId: string;
  checks: { action: string; allowed: boolean; error?: string }[];
  allAllowed: boolean;
};

// ── Broad IAM check (page load) ───────────────────────────

async function fetchPermissionsCheck(): Promise<PermissionsCheckResponse> {
  const res = await fetch('/api/restoration/permissions');
  if (!res.ok) throw new Error('Failed to check permissions');
  return res.json();
}

export function useRestorationPermissions() {
  return useQuery({
    queryKey: ['restorationPermissions'],
    queryFn: fetchPermissionsCheck,
    staleTime: 5 * 60 * 1000, // 5 minutes — permissions rarely change mid-session
    retry: false,
  });
}

// ── Instance-specific DryRun check ───────────────────────

async function fetchDryRunCheck(instanceId: string): Promise<DryRunCheckResponse> {
  const res = await fetch(`/api/instances/${instanceId}/dryrun-restore`);
  if (!res.ok) throw new Error('Failed to run dry-run check');
  return res.json();
}

export function useRestoreDryRunCheck(instanceId: string | null) {
  return useQuery({
    queryKey: ['restoreDryRun', instanceId],
    queryFn: () => fetchDryRunCheck(instanceId!),
    enabled: instanceId !== null,
    staleTime: 60 * 1000, // 1 minute
    retry: false,
  });
}
