import { type NextRequest } from 'next/server';
import { listRestoreJobs } from '@/lib/services/restoreJobs';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const status = searchParams.get('status') ?? undefined;
  const limit = parseInt(searchParams.get('limit') ?? '20', 10);

  const jobs = await listRestoreJobs({ status, limit: isNaN(limit) ? 20 : limit });
  return Response.json(jobs);
}
