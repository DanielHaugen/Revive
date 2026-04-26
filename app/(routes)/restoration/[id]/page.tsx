'use client';

import { use } from 'react';
import Link from 'next/link';
import { FaChevronLeft, FaCircleCheck, FaCircleXmark, FaClock, FaUser, FaMicrochip, FaImage, FaTriangleExclamation } from 'react-icons/fa6';
import { useAuditLog, useAuditLogs } from '@/lib/hooks/useAuditLogs';
import { RestoreTimeline, statusesFromOutcome } from '@/lib/ui/feedback/RestoreTimeline';
import { TableSkeleton } from '@/lib/ui/feedback/Skeleton';
import ErrorBanner from '@/lib/ui/feedback/ErrorBanner';

// ── Helpers ───────────────────────────────────────────────

function parseDetail(detail: string | null): Record<string, string> {
  if (!detail) return {};
  try { return JSON.parse(detail); } catch { return {}; }
}

function formatDuration(startIso: string, endIso: string): string {
  const diffMs = new Date(endIso).getTime() - new Date(startIso).getTime();
  const s = Math.floor(diffMs / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
}

function MetaRow({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-3 border-b border-gray-800 last:border-0">
      <span className="w-40 shrink-0 text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-200 break-all">{children}</span>
    </div>
  );
}

function StatusBadge({ action }: { action: string }) {
  const isCompleted = action === 'restore_completed';
  const isFailed = action === 'restore_failed';
  if (isCompleted)
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-900/50 text-green-400 border border-green-700/50">
        <FaCircleCheck className="text-xs" /> Completed
      </span>
    );
  if (isFailed)
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-900/50 text-red-400 border border-red-700/50">
        <FaCircleXmark className="text-xs" /> Failed
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-yellow-900/50 text-yellow-400 border border-yellow-700/50">
      Unknown
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────

export default function RestorationDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  // Support both Next.js 14 (sync) and 15 (async) params
  const resolvedParams = typeof (params as Promise<{ id: string }>).then === 'function'
    ? use(params as Promise<{ id: string }>)
    : (params as { id: string });

  const entryId = parseInt(resolvedParams.id, 10);

  // Fetch the primary audit log entry (restore_completed / restore_failed)
  const { data: entry, isLoading: entryLoading, error: entryError } = useAuditLog(
    isNaN(entryId) ? null : entryId,
  );

  // Use correlationId to fetch exactly the logs for this restore session
  const { data: relatedLogs } = useAuditLogs(
    entry?.correlationId
      ? { correlationId: entry.correlationId, pageSize: 10 }
      : {},
  );

  if (isNaN(entryId)) {
    return <ErrorBanner title="Invalid ID" message="The restoration ID in the URL is not valid." />;
  }

  if (entryLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="h-8 w-48 bg-gray-800 rounded animate-pulse" />
        <TableSkeleton rows={6} columns={2} />
      </div>
    );
  }

  if (entryError || !entry) {
    return <ErrorBanner message={entryError?.message ?? 'Restoration not found.'} />;
  }

  const detail = parseDetail(entry.detail);
  const isCompleted = entry.action === 'restore_completed';
  const isFailed = entry.action === 'restore_failed';
  const outcome: 'completed' | 'failed' = isCompleted ? 'completed' : 'failed';
  const statuses = statusesFromOutcome(outcome, detail.error);

  // Find the matching restore_started entry for this session
  const startEntry = relatedLogs?.logs.find((l) => l.action === 'restore_started');

  const userName = entry.user
    ? [entry.user.firstName, entry.user.lastName].filter(Boolean).join(' ') || entry.user.email
    : 'System';

  // All audit events for this session, sorted chronologically
  const timeline = [...(relatedLogs?.logs ?? [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/restoration"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition"
      >
        <FaChevronLeft className="text-xs" />
        Restorations
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Restoration Detail</h1>
          <p className="text-gray-500 text-sm mt-1 font-mono">{entry.resourceId ?? '—'}</p>
        </div>
        <StatusBadge action={entry.action} />
      </div>

      {/* Error banner */}
      {isFailed && detail.error && (
        <div className="flex gap-3 bg-red-950/40 border border-red-800/60 rounded-lg p-4">
          <FaTriangleExclamation className="text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-300 mb-1">Error message</p>
            <p className="text-xs font-mono text-red-200 break-all leading-relaxed">{detail.error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Metadata */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Metadata</h2>
          <div>
            <MetaRow label={<><FaMicrochip className="inline mr-1.5 text-gray-500" />Instance ID</>}>
              <span className="font-mono">{entry.resourceId ?? '—'}</span>
            </MetaRow>
            <MetaRow label={<><FaImage className="inline mr-1.5 text-gray-500" />Snapshot ID</>}>
              <span className="font-mono">{detail.snapshotId ?? '—'}</span>
            </MetaRow>
            {detail.newVolumeId && (
              <MetaRow label="New Volume ID">
                <span className="font-mono">{detail.newVolumeId}</span>
              </MetaRow>
            )}
            <MetaRow label={<><FaUser className="inline mr-1.5 text-gray-500" />Triggered by</>}>
              {userName}
            </MetaRow>
            {startEntry && (
              <MetaRow label={<><FaClock className="inline mr-1.5 text-gray-500" />Started at</>}>
                {new Date(startEntry.createdAt).toLocaleString()}
              </MetaRow>
            )}
            <MetaRow label={<><FaClock className="inline mr-1.5 text-gray-500" />{isCompleted ? 'Completed at' : 'Failed at'}</>}>
              {new Date(entry.createdAt).toLocaleString()}
            </MetaRow>
            {startEntry && (
              <MetaRow label="Duration">
                {formatDuration(startEntry.createdAt, entry.createdAt)}
              </MetaRow>
            )}
          </div>
        </div>

        {/* Steps */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Steps</h2>
          <RestoreTimeline statuses={statuses} />
        </div>
      </div>

      {/* Audit event timeline */}
      {timeline.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Event Log</h2>
          <ol className="space-y-4">
            {timeline.map((event, i) => {
              const evDetail = parseDetail(event.detail);
              const isCurrent = event.id === entry.id;
              return (
                <li key={event.id} className="flex gap-4">
                  {/* Timeline connector */}
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${
                      event.action === 'restore_completed' ? 'bg-green-400' :
                      event.action === 'restore_failed'    ? 'bg-red-400' :
                      'bg-blue-400'
                    }`} />
                    {i < timeline.length - 1 && (
                      <div className="w-px flex-1 bg-gray-700 mt-1" />
                    )}
                  </div>
                  {/* Content */}
                  <div className={`pb-4 flex-1 ${isCurrent ? 'opacity-100' : 'opacity-80'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded border ${
                        event.action === 'restore_completed' ? 'bg-green-900/50 text-green-300 border-green-700/50' :
                        event.action === 'restore_failed'    ? 'bg-red-900/50 text-red-300 border-red-700/50' :
                        'bg-blue-900/50 text-blue-300 border-blue-700/50'
                      }`}>
                        {event.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(event.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {Object.keys(evDetail).length > 0 && (
                      <div className="space-y-1 mt-2">
                        {Object.entries(evDetail).map(([k, v]) => (
                          <div key={k} className="flex gap-2 text-xs">
                            <span className="text-gray-500 shrink-0">{k}:</span>
                            <span className="font-mono text-gray-300 break-all">{v}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
