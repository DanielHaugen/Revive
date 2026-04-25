import prisma from '@/lib/prisma';

type AuditEntry = {
  action: string;
  resourceId?: string;
  detail?: string;
  userId?: number;
};

/** Write an audit log entry. Fire-and-forget safe. */
export async function logAudit(entry: AuditEntry) {
  try {
    await prisma.auditLog.create({ data: entry });
  } catch (err) {
    console.error('[audit] Failed to write audit log:', err);
  }
}

type ListAuditLogsParams = {
  page?: number;
  pageSize?: number;
  action?: string;
  resourceId?: string;
  userId?: number;
  since?: Date;
};

export async function listAuditLogs({
  page = 1,
  pageSize = 50,
  action,
  resourceId,
  userId,
  since,
}: ListAuditLogsParams = {}) {
  const where = {
    ...(action && { action: { contains: action } }),
    ...(resourceId && { resourceId: { contains: resourceId } }),
    ...(userId && { userId }),
    ...(since && { createdAt: { gte: since } }),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}
