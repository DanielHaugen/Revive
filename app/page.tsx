'use client';

import { useMemo } from 'react';
import Card from '@/lib/ui/card/Card';
import Link from 'next/link';
import {
  FaMicrochip,
  FaRegHardDrive,
  FaImage,
  FaBook,
  FaArrowRight,
  FaPlay,
  FaStop,
  FaRotateRight,
} from 'react-icons/fa6';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useInstances } from '@/lib/hooks/useInstances';
import { useSnapshots } from '@/lib/hooks/useSnapshots';
import { useVolumes } from '@/lib/hooks/useVolumes';
import { usePlaybooks } from '@/lib/hooks/usePlaybooks';
import { useAuditLogs, AuditLogEntry } from '@/lib/hooks/useAuditLogs';
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
  const sevenDaysAgo = useMemo(() => { const d = new Date(); d.setDate(d.getDate() - 6); d.setHours(0, 0, 0, 0); return d; }, []);
  const { data: auditAllData } = useAuditLogs({ pageSize: 500, since: sevenDaysAgo });
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

  // Activity bar chart — last 7 days bucketed from audit log
  const activityChartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dayStr: d.toDateString(),
        events: 0,
      };
    });
    for (const log of auditAllData?.logs ?? []) {
      const match = days.find((d) => d.dayStr === new Date(log.createdAt).toDateString());
      if (match) match.events++;
    }
    return days.map(({ label, events }) => ({ label, events }));
  }, [auditAllData]);

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
    <div className="flex flex-col gap-6 flex-1">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Infrastructure overview and quick actions.</p>
      </div>

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

      {/* Main content — 3-col grid, 2 rows: chart/playbooks on top, feed/actions below */}
      <div className="grid grid-cols-1 lg:grid-cols-3 grid-rows-[auto_fr] gap-4 flex-1 min-h-0">

        {/* Row 1 left: Activity chart — same height as starred playbooks */}
        <Card className="my-0 p-5 lg:col-span-2">
          <h2 className="text-base font-semibold text-white mb-4">Activity — Last 7 Days</h2>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={activityChartData} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '6px', color: '#f3f4f6', fontSize: '12px' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar dataKey="events" name="Events" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Row 1 right: Starred Playbooks */}
        <Card className="my-0 p-5 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white">Starred Playbooks</h2>
            <Link href="/playbooks" className="text-xs text-blue-400 hover:text-blue-300 transition">
              All →
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {starredPlaybooks.length > 0 ? (
              starredPlaybooks.map((pb) => (
                <Link
                  key={pb.id}
                  href={`/playbooks/${pb.id}`}
                  className="flex items-center justify-between bg-gray-800 rounded-md px-3 py-2 hover:bg-gray-700 transition group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FaBook className="text-amber-400 text-xs shrink-0" />
                    <span className="text-sm text-gray-200 truncate">{pb.name}</span>
                  </div>
                  <FaArrowRight className="text-gray-600 group-hover:text-gray-400 text-xs transition shrink-0" />
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-sm py-2 text-center">Star a playbook to see it here.</p>
            )}
          </div>
        </Card>

        {/* Row 2 left: Recent Activity — fills remaining height */}
        <Card className="my-0 p-5 lg:col-span-2 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white">Recent Activity</h2>
            <Link href="/logs" className="text-xs text-blue-400 hover:text-blue-300 transition">
              View all →
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            {auditData && auditData.logs.length > 0 ? (
              auditData.logs.map((log) => (
                <ActivityItem key={log.id} log={log} />
              ))
            ) : (
              <p className="text-gray-500 text-sm py-4 text-center">No activity recorded yet.</p>
            )}
          </div>
        </Card>

        {/* Row 2 right: Quick Actions — fills remaining height */}
        <Card className="my-0 p-5 flex flex-col min-h-0">
          <h2 className="text-base font-semibold text-white mb-3">Quick Actions</h2>
          <div className="flex-1 overflow-y-auto space-y-2">
            {frequentInstances.length > 0 ? (
              frequentInstances.map((inst) => {
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
              })
            ) : (
              <p className="text-gray-500 text-sm py-2 text-center">No instances available.</p>
            )}
          </div>
        </Card>

      </div>
    </div>
  );
}
