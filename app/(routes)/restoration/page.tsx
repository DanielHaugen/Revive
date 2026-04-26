'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import Card from '@/lib/ui/card/Card';
import Button from '@/lib/ui/buttons/Button';
import SearchDropdown from '@/lib/ui/inputs/SearchableDropdown';
import type { Option } from '@/lib/ui/inputs/SearchableDropdown';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import {
  FaRotateRight,
  FaSpinner,
  FaTriangleExclamation,
  FaCircleExclamation,
  FaArrowUpRightFromSquare,
} from 'react-icons/fa6';
import { useInstances } from '@/lib/hooks/useInstances';
import { useSnapshots } from '@/lib/hooks/useSnapshots';
import { useAuditLogs } from '@/lib/hooks/useAuditLogs';
import { useRestoreDryRunCheck } from '@/lib/hooks/useRestorationPermissions';
import {
  INITIAL_STATUSES,
  parseMessageToStep,
  RestoreTimeline,
} from '@/lib/ui/feedback/RestoreTimeline';
import type { StepStatus } from '@/lib/ui/feedback/RestoreTimeline';

function RestoreConfirmModal({
  instanceLabel,
  snapshotLabel,
  onConfirm,
  onCancel,
}: {
  instanceLabel: string;
  snapshotLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-6 max-w-md w-full text-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <FaTriangleExclamation className="text-yellow-400 text-xl flex-shrink-0" />
          <h2 className="text-lg font-semibold">Confirm Restoration</h2>
        </div>
        <div className="space-y-1 mb-4 text-sm">
          <div>
            <span className="text-gray-400">Instance: </span>
            <span className="font-mono text-white break-all">{instanceLabel}</span>
          </div>
          <div>
            <span className="text-gray-400">Snapshot: </span>
            <span className="font-mono text-white break-all">{snapshotLabel}</span>
          </div>
        </div>
        <p className="text-sm text-yellow-200 bg-yellow-900/30 border border-yellow-700/50 rounded p-3 mb-5">
          This will stop the instance, replace its root volume with the selected
          snapshot, and restart it.{' '}
          <strong>This cannot be undone.</strong>
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Restore Now
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function parseDetail(detail: string | null): Record<string, string> {
  if (!detail) return {};
  try { return JSON.parse(detail); }
  catch { return {}; }
}

// ── Main page ─────────────────────────────────────────────

const RestorationPage = () => {
  const queryClient = useQueryClient();
  const { data: instances = [] } = useInstances();
  const { data: snapshots = [] } = useSnapshots();
  const { data: logsData, refetch: refetchLogs } = useAuditLogs({ action: 'restore', pageSize: 20 });

  const [selectedInstance, setSelectedInstance] = useState<Option | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState<Option | null>(null);
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(INITIAL_STATUSES);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // DryRun permission check — runs once an instance is selected
  const { data: dryRunData, isLoading: dryRunLoading } = useRestoreDryRunCheck(
    selectedInstance?.value ?? null,
  );

  const instanceOptions: Option[] = instances.map((inst) => ({
    value: inst.InstanceId ?? '',
    label: `${inst.Tags?.find((t) => t.Key === 'Name')?.Value ?? 'Unnamed'} (${inst.InstanceId}) [${inst.PrivateIpAddress ?? ''}]`,
  }));

  const snapshotOptions: Option[] = snapshots.map((snap) => ({
    value: snap.SnapshotId ?? '',
    label: `${snap.Tags?.find((t) => t.Key === 'Name')?.Value ?? snap.SnapshotId} — ${
      snap.StartTime ? new Date(snap.StartTime).toLocaleString() : ''
    }`,
  }));

  const historyEntries = (logsData?.logs ?? []).filter(
    (e) => e.action !== 'restore_started',
  );

  /**
   * Connect to a job's SSE stream and drive the timeline UI.
   * Safe to call on mount for reconnection — replays all stored steps from the beginning.
   */
  const connectToJobStream = useCallback(async (jobId: number) => {
    setStepStatuses(INITIAL_STATUSES);
    setShowTimeline(true);
    setIsRestoring(true);

    let hadError = false;

    try {
      const res = await fetch(`/api/restoration/jobs/${jobId}/stream`);
      if (!res.ok || !res.body) throw new Error('Failed to connect to restore stream');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        for (const line of text.split('\n\n')) {
          const msg = line.replace(/^data: /, '').trim();
          if (!msg) continue;

          if (msg.toLowerCase().startsWith('error:')) hadError = true;

          const parsed = parseMessageToStep(msg);
          if (parsed) {
            setStepStatuses((prev) => {
              const next = [...prev] as StepStatus[];
              if (parsed.step === -1) {
                const idx = next.findIndex((s) => s === 'active' || s === 'pending');
                if (idx !== -1) next[idx] = 'error';
              } else {
                next[parsed.step] = parsed.status;
              }
              return next;
            });
          }
        }
      }

      if (hadError) toast.error('Restoration failed.');
      else toast.success('Restoration complete.');
    } catch {
      toast.error('Restoration failed.');
      setStepStatuses((prev) => {
        const next = [...prev] as StepStatus[];
        const idx = next.findIndex((s) => s === 'active' || s === 'pending');
        if (idx !== -1) next[idx] = 'error';
        return next;
      });
    } finally {
      setIsRestoring(false);
      refetchLogs();
      queryClient.invalidateQueries({ queryKey: ['instances'] });
      queryClient.invalidateQueries({ queryKey: ['syncStatus'] });
    }
  }, [queryClient, refetchLogs]);

  // On mount: reconnect to any in-progress restore (handles browser refresh mid-restore)
  const mountCheckDone = useRef(false);
  useEffect(() => {
    if (mountCheckDone.current) return;
    mountCheckDone.current = true;
    fetch('/api/restoration/jobs?status=running&limit=1')
      .then((r) => r.ok ? r.json() : [])
      .then((jobs: { id: number }[]) => {
        if (jobs.length > 0) connectToJobStream(jobs[0].id);
      })
      .catch(() => { /* ignore */ });
  }, [connectToJobStream]);

  const runRestore = async () => {
    if (!selectedInstance || !selectedSnapshot) return;
    setShowConfirm(false);
    toast.info('Starting restoration…');

    const instanceName =
      instances.find((inst) => inst.InstanceId === selectedInstance.value)
        ?.Tags?.find((t) => t.Key === 'Name')?.Value ?? undefined;

    try {
      const res = await fetch(
        `/api/instances/${selectedInstance.value}/restore/${selectedSnapshot.value}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ instanceName }),
        },
      );
      if (!res.ok) throw new Error('Failed to start restoration');

      const { jobId } = await res.json() as { jobId: number };
      connectToJobStream(jobId);
    } catch {
      toast.error('Failed to start restoration.');
    }
  };

  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-semibold mb-6">EC2 Restorations</h1>

      {/* ── DryRun permission check (runs after instance selection) ── */}
      {selectedInstance && !dryRunLoading && dryRunData && !dryRunData.allAllowed && (
        <div className="mb-4 bg-red-950/40 border border-red-800/60 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FaTriangleExclamation className="text-red-400 flex-shrink-0" />
            <p className="text-sm font-semibold text-red-300">Missing IAM permissions — restore will fail</p>
          </div>
          <ul className="space-y-1 mt-1">
            {dryRunData.checks.filter((c) => !c.allowed).map((c) => (
              <li key={c.action} className="flex items-center gap-2 text-xs text-red-300">
                <FaCircleExclamation className="text-red-400 flex-shrink-0" />
                <span className="font-mono">{c.action}</span>
                <span className="text-red-600">— permission denied</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-400 mt-3">
            See the{' '}
            <a href="/docs/aws/AWS_Configuration" className="underline hover:text-white">AWS Configuration guide</a>{' '}
            for the required IAM policy.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-x-8 gap-y-2">
        {/* New Restoration */}
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold">New Restoration</h2>

          <div>
            <label className="block mb-2 font-medium text-sm">Select Instance</label>
            <SearchDropdown
              options={instanceOptions}
              value={selectedInstance}
              onChange={(opt) => {
                setSelectedInstance(opt);
                setSelectedSnapshot(null);
              }}
              placeholder="Select an instance…"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-sm">Select Snapshot</label>
            <SearchDropdown
              key={selectedInstance?.value ?? 'none'}
              options={snapshotOptions}
              value={selectedSnapshot}
              onChange={(opt) => setSelectedSnapshot(opt)}
              placeholder="Select a snapshot…"
              disabled={!selectedInstance}
            />
          </div>

          <Button
            onClick={() => setShowConfirm(true)}
            disabled={
              !selectedInstance ||
              !selectedSnapshot ||
              isRestoring ||
              (dryRunData != null && !dryRunData.allAllowed)
            }
            className="flex items-center justify-center w-full"
          >
            {isRestoring ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : (
              <FaRotateRight className="mr-2" />
            )}
            {isRestoring ? 'Restoring…' : 'Restore Instance'}
          </Button>
        </Card>

        {/* Recent Restorations */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Recent Restorations</h2>
          {historyEntries.length === 0 ? (
            <p className="text-sm text-gray-500">No restoration history yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-700">
                    <th className="pb-2 pr-4 font-medium">Time</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 pr-4 font-medium">Instance</th>
                    <th className="pb-2 pr-4 font-medium">Snapshot</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {historyEntries.map((entry) => {
                    const detail = parseDetail(entry.detail);
                    const isCompleted = entry.action === 'restore_completed';
                    return (
                      <tr
                        key={entry.id}
                        className="border-b border-gray-800 hover:bg-gray-800/40 group"
                      >
                        <td className="py-2 pr-4 text-gray-400 whitespace-nowrap">
                          {formatRelativeTime(entry.createdAt)}
                        </td>
                        <td className="py-2 pr-4">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              isCompleted
                                ? 'bg-green-900/50 text-green-400'
                                : 'bg-red-900/50 text-red-400'
                            }`}
                          >
                            {isCompleted ? 'Completed' : 'Failed'}
                          </span>
                        </td>
                        <td className="py-2 pr-4 text-xs text-gray-300">
                          {detail.instanceName
                            ? <><span>{detail.instanceName}</span><span className="ml-1 text-gray-500 font-mono">({entry.resourceId})</span></>
                            : <span className="font-mono">{entry.resourceId ?? '—'}</span>}
                        </td>
                        <td className="py-2 font-mono text-xs text-gray-300">
                          {detail.snapshotId ?? '—'}
                        </td>
                        <td className="py-2 pl-2 text-right">
                          <Link
                            href={`/restoration/${entry.id}`}
                            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-blue-400 transition opacity-0 group-hover:opacity-100"
                          >
                            <FaArrowUpRightFromSquare className="text-[10px]" />
                            Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Restore progress timeline */}
      {showTimeline && (
        <Card className="mt-0">
          <h2 className="text-lg font-semibold mb-4">Restore Progress</h2>
          <RestoreTimeline statuses={stepStatuses} />
        </Card>
      )}

      {/* Confirmation modal */}
      {showConfirm && selectedInstance && selectedSnapshot && (
        <RestoreConfirmModal
          instanceLabel={selectedInstance.label}
          snapshotLabel={selectedSnapshot.label}
          onConfirm={runRestore}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
};

export default RestorationPage;
