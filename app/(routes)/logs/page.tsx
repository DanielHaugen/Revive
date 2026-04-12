'use client';

import { useState } from 'react';
import { useAuditLogs, AuditLogEntry } from '@/lib/hooks/useAuditLogs';
import DataTable, { Column } from '@/lib/ui/tables/DataTable';
import { TableSkeleton } from '@/lib/ui/feedback/Skeleton';
import ErrorBanner from '@/lib/ui/feedback/ErrorBanner';
import { FaMagnifyingGlass, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';

const AuditLogsPage = () => {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');

  const { data, isLoading, error } = useAuditLogs({
    page,
    pageSize: 25,
    action: actionFilter || undefined,
    resourceId: resourceFilter || undefined,
  });

  const columns: Column<AuditLogEntry>[] = [
    {
      header: 'Timestamp',
      accessor: 'createdAt',
      render: (value) => (
        <span className="text-gray-300 whitespace-nowrap">
          {new Date(value as string).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (value) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-200">
          {value as string}
        </span>
      ),
    },
    {
      header: 'Resource ID',
      accessor: 'resourceId',
      render: (value) =>
        value ? (
          <span className="font-mono text-xs text-gray-400">{value as string}</span>
        ) : (
          <span className="text-gray-600">—</span>
        ),
    },
    {
      header: 'Detail',
      accessor: 'detail',
      render: (value) => (
        <span className="text-gray-300 text-sm">{(value as string) || '—'}</span>
      ),
    },
    {
      header: 'User',
      accessor: (item) => {
        if (!item.user) return 'System';
        const name = [item.user.firstName, item.user.lastName].filter(Boolean).join(' ');
        return name || item.user.email;
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold text-white">Audit Logs</h1></div>
        <TableSkeleton rows={10} columns={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold text-white">Audit Logs</h1></div>
        <ErrorBanner message={error.message} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="shrink-0">
          <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
          <p className="text-gray-400 text-sm mt-1">
            {data?.total || 0} total entries
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
            <input
              type="text"
              placeholder="Filter by action..."
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="w-52 bg-gray-800 border border-gray-700 rounded-md py-2 pl-9 pr-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>
          <div className="relative">
            <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
            <input
              type="text"
              placeholder="Filter by resource ID..."
              value={resourceFilter}
              onChange={(e) => { setResourceFilter(e.target.value); setPage(1); }}
              className="w-52 bg-gray-800 border border-gray-700 rounded-md py-2 pl-9 pr-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <DataTable data={data?.logs || []} columns={columns} />
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Page {data.page} of {data.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-md text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <FaChevronLeft className="text-xs" /> Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page >= data.totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-md text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next <FaChevronRight className="text-xs" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;
