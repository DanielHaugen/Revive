import { NextResponse } from 'next/server';
import { listAuditLogs } from '@/lib/services/audit';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(500, Math.max(1, parseInt(searchParams.get('pageSize') || '50', 10)));
  const action = searchParams.get('action') || undefined;
  const resourceId = searchParams.get('resourceId') || undefined;
  const correlationId = searchParams.get('correlationId') || undefined;
  const sinceParam = searchParams.get('since');
  const since = sinceParam ? new Date(sinceParam) : undefined;

  try {
    const result = await listAuditLogs({ page, pageSize, action, resourceId, correlationId, since });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error listing audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to list audit logs' },
      { status: 500 }
    );
  }
}
