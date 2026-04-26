import { type NextRequest } from 'next/server';
import { getRestoreJob } from '@/lib/services/restoreJobs';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const jobId = parseInt(params.id, 10);
  if (isNaN(jobId)) {
    return new Response(JSON.stringify({ error: 'Invalid job ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const job = await getRestoreJob(jobId);
  if (!job) {
    return new Response(JSON.stringify({ error: 'Job not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return Response.json(job);
}
