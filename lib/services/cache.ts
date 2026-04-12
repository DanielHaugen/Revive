import prisma from '@/lib/prisma';
import { Instance, Volume, Snapshot } from '@aws-sdk/client-ec2';

/** Read all cached instances. */
export async function getCachedInstances(): Promise<Instance[]> {
  const rows = await prisma.cachedInstance.findMany({
    orderBy: { syncedAt: 'desc' },
  });
  return rows.map((r) => r.data as unknown as Instance);
}

/** Read a single cached instance by ID. */
export async function getCachedInstance(
  instanceId: string,
): Promise<Instance | null> {
  const row = await prisma.cachedInstance.findUnique({
    where: { instanceId },
  });
  return row ? (row.data as unknown as Instance) : null;
}

/** Read all cached volumes. */
export async function getCachedVolumes(): Promise<Volume[]> {
  const rows = await prisma.cachedVolume.findMany({
    orderBy: { syncedAt: 'desc' },
  });
  return rows.map((r) => r.data as unknown as Volume);
}

/** Read all cached snapshots. */
export async function getCachedSnapshots(): Promise<Snapshot[]> {
  const rows = await prisma.cachedSnapshot.findMany({
    orderBy: { syncedAt: 'desc' },
  });
  return rows.map((r) => r.data as unknown as Snapshot);
}

/** Read a single cached snapshot by ID. */
export async function getCachedSnapshot(
  snapshotId: string,
): Promise<Snapshot | null> {
  const row = await prisma.cachedSnapshot.findUnique({
    where: { snapshotId },
  });
  return row ? (row.data as unknown as Snapshot) : null;
}

/** Check whether the cache has been populated at least once. */
export async function isCachePopulated(): Promise<boolean> {
  const status = await prisma.syncStatus.findUnique({
    where: { id: 'singleton' },
  });
  return status?.lastSyncAt !== null && status?.lastSyncAt !== undefined;
}
