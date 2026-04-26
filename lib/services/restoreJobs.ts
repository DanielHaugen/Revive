import prisma from '@/lib/prisma';

export async function createRestoreJob(params: {
  instanceId: string;
  instanceName?: string;
  snapshotId: string;
  correlationId: string;
  userId?: number;
}) {
  return prisma.restoreJob.create({ data: params });
}

/** Append a single progress message to the job's steps array (sequential, no concurrency issues). */
export async function appendJobStep(id: number, message: string): Promise<void> {
  const job = await prisma.restoreJob.findUnique({ where: { id }, select: { steps: true } });
  if (!job) return;
  const steps = (job.steps as string[]) ?? [];
  await prisma.restoreJob.update({
    where: { id },
    data: { steps: [...steps, message] },
  });
}

export async function completeRestoreJob(id: number): Promise<void> {
  await prisma.restoreJob.update({ where: { id }, data: { status: 'completed' } });
}

export async function failRestoreJob(id: number): Promise<void> {
  await prisma.restoreJob.update({ where: { id }, data: { status: 'failed' } });
}

export async function getRestoreJob(id: number) {
  return prisma.restoreJob.findUnique({ where: { id } });
}

export async function listRestoreJobs(params: { status?: string; limit?: number } = {}) {
  return prisma.restoreJob.findMany({
    where: params.status ? { status: params.status } : undefined,
    orderBy: { createdAt: 'desc' },
    take: params.limit ?? 20,
  });
}
