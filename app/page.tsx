'use client';

import { useMemo } from 'react';
import Card from '@/lib/ui/card/Card';
import Link from 'next/link';
import {
  FaMicrochip,
  FaRegHardDrive,
  FaImage,
  FaBook,
  FaCircleCheck,
  FaCircleXmark,
  FaCirclePause,
  FaArrowRight,
  FaPlay,
  FaStop,
  FaRotateRight,
} from 'react-icons/fa6';
import { useInstances } from '@/lib/hooks/useInstances';
import { useSnapshots } from '@/lib/hooks/useSnapshots';
import { useVolumes } from '@/lib/hooks/useVolumes';
import { usePlaybooks } from '@/lib/hooks/usePlaybooks';
import { useAuditLogs, AuditLogEntry } from '@/lib/hooks/useAuditLogs';
import { useSyncStatus } from '@/lib/hooks/useSync';
import Spinner from '@/lib/ui/feedback/Spinner';
import { Instance } from '@aws-sdk/client-ec2';
import { startInstance, stopInstance, rebootInstance } from '@/lib/api/instances';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import Button from '@/lib/ui/buttons/Button';

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: number;
  href: string;
  breakdown?: { label: string; count: number; color: string }[];
};

function StatCard({ icon, label, value, href, breakdown }: StatCardProps) {
  return (
    <Link href={href}>
      <Card className="p-5 hover:border-gray-600 transition group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800 group-hover:bg-blue-600/20 transition">
              {icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-sm text-gray-400">{label}</p>
            </div>
          </div>
          <FaArrowRight className="text-gray-600 group-hover:text-gray-400 transition" />
        </div>
        {breakdown && breakdown.length > 0 && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-800">
            {breakdown.map((b) => (
              <span key={b.label} className="flex items-center gap-1 text-xs text-gray-400">
                <span className={`w-2 h-2 rounded-full ${b.color}`} />
                {b.count} {b.label}
              </span>
            ))}
          </div>
        )}
      </Card>
    </Link>
  );
}

function ActivityItem({ log }: { log: AuditLogEntry }) {
  const user = log.user
    ? [log.user.firstName, log.user.lastName].filter(Boolean).join(' ') || log.user.email
    : 'System';
  return (
    <div className="flex items-start justify-between gap-2 py-2.5 border-b border-gray-800 last:border-0">
      <div className="min-w-0">
        <p className="text-sm text-gray-200 truncate">
          <span className="font-medium">{user}</span>{' '}
          <span className="text-gray-400">{log.detail || log.action}</span>
        </p>
        {log.resourceId && (
          <p className="text-xs text-gray-500 font-mono truncate">{log.resourceId}</p>
        )}
      </div>
      <span className="text-xs text-gray-500 whitespace-nowrap shrink-0">
        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
}

export default function Home() {
  const { data: instances = [], isLoading: loadingInstances } = useInstances();
  const { data: snapshots = [], isLoading: loadingSnapshots } = useSnapshots();
  const { data: volumes = [], isLoading: loadingVolumes } = useVolumes();
  const { data: playbooks = [], isLoading: loadingPlaybooks } = usePlaybooks();
  const { data: auditData } = useAuditLogs({ pageSize: 10 });
  const { data: syncStatus } = useSyncStatus();
  const queryClient = useQueryClient();

  const loading = loadingInstances || loadingSnapshots || loadingVolumes || loadingPlaybooks;

  const instanceBreakdown = useMemo(() => {
    const running = instances.filter((i: Instance) => i.State?.Name === 'running').length;
    const stopped = instances.filter((i: Instance) => i.State?.Name === 'stopped').length;
    const other = instances.length - running - stopped;
    return [
      { label: 'running', count: running, color: 'bg-green-500' },
      { label: 'stopped', count: stopped, color: 'bg-red-500' },
      ...(other > 0 ? [{ label: 'other', count: other, color: 'bg-yellow-500' }] : []),
    ];
  }, [instances]);

  const volumeBreakdown = useMemo(() => {
    const inUse = volumes.filter((v) => v.State === 'in-use').length;
    const available = volumes.filter((v) => v.State === 'available').length;
    return [
      { label: 'in-use', count: inUse, color: 'bg-blue-500' },
      { label: 'available', count: available, color: 'bg-green-500' },
    ];
  }, [volumes]);

  const snapshotBreakdown = useMemo(() => {
    const completed = snapshots.filter((s) => s.State === 'completed').length;
    const pending = snapshots.filter((s) => s.State === 'pending').length;
    const errored = snapshots.length - completed - pending;
    return [
      { label: 'completed', count: completed, color: 'bg-green-500' },
      ...(pending > 0 ? [{ label: 'pending', count: pending, color: 'bg-yellow-500' }] : []),
      ...(errored > 0 ? [{ label: 'error', count: errored, color: 'bg-red-500' }] : []),
    ];
  }, [snapshots]);

  const playbookBreakdown = useMemo(() => {
    const starred = playbooks.filter((p) => p.starred).length;
    const unstarred = playbooks.length - starred;
    return [
      { label: 'starred', count: starred, color: 'bg-amber-500' },
      { label: 'unstarred', count: unstarred, color: 'bg-gray-500' },
    ];
  }, [playbooks]);

  const starredPlaybooks = useMemo(
    () => playbooks.filter((p) => p.starred),
    [playbooks]
  );

  const frequentInstances = useMemo(
    () => instances.slice(0, 4),
    [instances]
  );

  const handleQuickAction = async (
    action: 'start' | 'stop' | 'reboot',
    instanceId: string
  ) => {
    try {
      if (action === 'start') await startInstance(instanceId);
      else if (action === 'stop') await stopInstance(instanceId);
      else await rebootInstance(instanceId);
      toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} initiated`);
      queryClient.invalidateQueries({ queryKey: ['instances'] });
    } catch {
      toast.error(`Failed to ${action} instance`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Infrastructure overview and quick actions.</p>
      </div>

      {/* System Status Banner */}
      {syncStatus && (
        <div className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-5 py-3">
          <div className="flex items-center gap-3">
            {syncStatus.inProgress ? (
              <>
                <Spinner size="sm" />
                <span className="text-sm text-gray-300">Syncing resources...</span>
              </>
            ) : syncStatus.lastError ? (
              <>
                <FaCircleXmark className="text-red-400" />
                <span className="text-sm text-red-300">Sync error: {syncStatus.lastError}</span>
              </>
            ) : (
              <>
                <FaCircleCheck className="text-green-400" />
                <span className="text-sm text-gray-300">
                  AWS connected — last sync{' '}
                  {syncStatus.lastSyncAt
                    ? new Date(syncStatus.lastSyncAt).toLocaleTimeString()
                    : 'never'}
                </span>
              </>
            )}
          </div>
          <span className="text-xs text-gray-500">
            {instances.length} instances · {volumes.length} volumes · {snapshots.length} snapshots
          </span>
        </div>
      )}

      {/* Resource Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FaMicrochip className="text-blue-400" />}
          label="Instances"
          value={instances.length}
          href="/instances"
          breakdown={instanceBreakdown}
        />
        <StatCard
          icon={<FaRegHardDrive className="text-purple-400" />}
          label="Volumes"
          value={volumes.length}
          href="/volumes"
          breakdown={volumeBreakdown}
        />
        <StatCard
          icon={<FaImage className="text-green-400" />}
          label="Snapshots"
          value={snapshots.length}
          href="/snapshots"
          breakdown={snapshotBreakdown}
        />
        <StatCard
          icon={<FaBook className="text-amber-400" />}
          label="Playbooks"
          value={playbooks.length}
          href="/playbooks"
          breakdown={playbookBreakdown}
        />
      </div>

      {/* Bottom Grid: Activity Feed + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            <Link href="/logs" className="text-xs text-blue-400 hover:text-blue-300 transition">
              View all →
            </Link>
          </div>
          {auditData && auditData.logs.length > 0 ? (
            <div>
              {auditData.logs.map((log) => (
                <ActivityItem key={log.id} log={log} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm py-4 text-center">No activity recorded yet.</p>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="space-y-4">
          {/* Starred Playbooks */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">Starred Playbooks</h2>
              <Link href="/playbooks" className="text-xs text-blue-400 hover:text-blue-300 transition">
                All playbooks →
              </Link>
            </div>
            {starredPlaybooks.length > 0 ? (
              <div className="space-y-2">
                {starredPlaybooks.map((pb) => (
                  <Link
                    key={pb.id}
                    href={`/playbooks/${pb.id}`}
                    className="flex items-center justify-between bg-gray-800 rounded-md px-3 py-2 hover:bg-gray-700 transition group"
                  >
                    <div className="flex items-center gap-2">
                      <FaBook className="text-amber-400 text-xs" />
                      <span className="text-sm text-gray-200">{pb.name}</span>
                    </div>
                    <FaArrowRight className="text-gray-600 group-hover:text-gray-400 text-xs transition" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm py-2 text-center">Star a playbook to see it here.</p>
            )}
          </Card>

          {/* Quick Instance Actions */}
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-white mb-3">Quick Actions</h2>
            {frequentInstances.length > 0 ? (
              <div className="space-y-2">
                {frequentInstances.map((inst) => {
                  const name = inst.Tags?.find((t) => t.Key === 'Name')?.Value || inst.InstanceId;
                  const isRunning = inst.State?.Name === 'running';
                  const isStopped = inst.State?.Name === 'stopped';
                  return (
                    <div
                      key={inst.InstanceId}
                      className="flex items-center justify-between bg-gray-800 rounded-md px-3 py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isRunning ? 'bg-green-500' : isStopped ? 'bg-red-500' : 'bg-yellow-500'
                          }`}
                        />
                        <span className="text-sm text-gray-200 truncate">{name}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {isStopped && (
                          <Button
                            onClick={() => handleQuickAction('start', inst.InstanceId!)}
                            className="px-2 py-1 text-xs"
                            ariaLabel="Start"
                          >
                            <FaPlay className="text-[10px]" />
                          </Button>
                        )}
                        {isRunning && (
                          <>
                            <Button
                              onClick={() => handleQuickAction('stop', inst.InstanceId!)}
                              variant="danger"
                              className="px-2 py-1 text-xs"
                              ariaLabel="Stop"
                            >
                              <FaStop className="text-[10px]" />
                            </Button>
                            <Button
                              onClick={() => handleQuickAction('reboot', inst.InstanceId!)}
                              variant="warning"
                              className="px-2 py-1 text-xs"
                              ariaLabel="Reboot"
                            >
                              <FaRotateRight className="text-[10px]" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm py-2 text-center">No instances available.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
