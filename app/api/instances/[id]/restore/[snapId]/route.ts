import { awsInstanceIdSchema, awsSnapshotIdSchema } from '@/lib/validation/schemas';
import { getAuthUser } from '@/lib/services/session';
import { createRestoreJob } from '@/lib/services/restoreJobs';
import { runRestoreJob } from '@/lib/services/restoreRunner';

export async function POST(
  request: Request,
  { params }: { params: { id: string; snapId: string } },
) {
  const idResult = awsInstanceIdSchema.safeParse(params.id);
  const snapResult = awsSnapshotIdSchema.safeParse(params.snapId);
  if (!idResult.success || !snapResult.success) {
    return new Response(JSON.stringify({ error: 'Invalid instance or snapshot ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const user = await getAuthUser();
  const body = await request.json().catch(() => ({})) as { instanceName?: string };

  const instanceId = idResult.data;
  const snapshotId = snapResult.data;
  const correlationId = crypto.randomUUID();

  const job = await createRestoreJob({
    instanceId,
    instanceName: body.instanceName,
    snapshotId,
    correlationId,
    userId: user?.userId,
  });

  // Detach from the HTTP request lifecycle — runs to completion even if the client disconnects.
  runRestoreJob({
    jobId: job.id,
    instanceId,
    instanceName: body.instanceName,
    snapshotId,
    correlationId,
    userId: user?.userId,
  }).catch((err) => {
    console.error('[restore] Unhandled error in runRestoreJob:', err);
  });

  return Response.json({ jobId: job.id });
}
