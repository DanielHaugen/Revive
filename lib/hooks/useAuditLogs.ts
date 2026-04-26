'use client';

import { useQuery } from '@tanstack/react-query';

type AuditLogUser = {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
};

export type AuditLogEntry = {
  id: number;
  action: string;
  resourceId: string | null;
  detail: string | null;
  correlationId: string | null;
  userId: number | null;
  user: AuditLogUser | null;
  createdAt: string;
};

type AuditLogResponse = {
  logs: AuditLogEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type UseAuditLogsParams = {
  page?: number;
  pageSize?: number;
  action?: string;
  resourceId?: string;
  correlationId?: string;
  since?: Date;
};

async function fetchAuditLogs(params: UseAuditLogsParams): Promise<AuditLogResponse> {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.pageSize) qs.set('pageSize', String(params.pageSize));
  if (params.action) qs.set('action', params.action);
  if (params.resourceId) qs.set('resourceId', params.resourceId);
  if (params.correlationId) qs.set('correlationId', params.correlationId);
  if (params.since) qs.set('since', params.since.toISOString());

  const res = await fetch(`/api/logs?${qs.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}

export function useAuditLogs(params: UseAuditLogsParams = {}) {
  return useQuery({
    queryKey: ['auditLogs', params],
    queryFn: () => fetchAuditLogs(params),
  });
}

async function fetchAuditLog(id: number): Promise<AuditLogEntry> {
  const res = await fetch(`/api/logs/${id}`);
  if (!res.ok) throw new Error('Failed to fetch audit log');
  return res.json();
}

export function useAuditLog(id: number | null) {
  return useQuery({
    queryKey: ['auditLog', id],
    queryFn: () => fetchAuditLog(id!),
    enabled: id !== null,
  });
}
