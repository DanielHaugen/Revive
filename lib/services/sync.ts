import prisma from '@/lib/prisma';
import { listInstances } from '@/lib/services/instances';
import { listVolumes } from '@/lib/services/volumes';
import { listSnapshots } from '@/lib/services/snapshots';

/** Sync all AWS resources into local cache tables. */
export async function syncAll() {
  // Mark sync as in-progress
  await prisma.syncStatus.upsert({
    where: { id: 'singleton' },
    update: { inProgress: true },
    create: { id: 'singleton', inProgress: true },
  });

  try {
    await Promise.all([syncInstances(), syncVolumes(), syncSnapshots()]);

    await prisma.syncStatus.update({
      where: { id: 'singleton' },
      data: { lastSyncAt: new Date(), lastError: null, inProgress: false },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown sync error';

    await prisma.syncStatus.update({
      where: { id: 'singleton' },
      data: { lastError: message, inProgress: false },
    });

    throw error;
  }
}

/** Sync EC2 instances into cache. */
export async function syncInstances() {
  const instances = await listInstances();
  const now = new Date();

  const currentIds = instances
    .map((i) => i.InstanceId)
    .filter((id): id is string => !!id);

  await prisma.$transaction([
    // Remove instances that no longer exist in AWS
    prisma.cachedInstance.deleteMany({
      where: { instanceId: { notIn: currentIds } },
    }),
    // Upsert each instance
    ...instances
      .filter((i) => i.InstanceId)
      .map((instance) =>
        prisma.cachedInstance.upsert({
          where: { instanceId: instance.InstanceId! },
          update: { data: instance as object, syncedAt: now },
          create: {
            instanceId: instance.InstanceId!,
            data: instance as object,
            syncedAt: now,
          },
        }),
      ),
  ]);
}

/** Sync EBS volumes into cache. */
export async function syncVolumes() {
  const volumes = await listVolumes();
  const now = new Date();

  const currentIds = volumes
    .map((v) => v.VolumeId)
    .filter((id): id is string => !!id);

  await prisma.$transaction([
    prisma.cachedVolume.deleteMany({
      where: { volumeId: { notIn: currentIds } },
    }),
    ...volumes
      .filter((v) => v.VolumeId)
      .map((volume) =>
        prisma.cachedVolume.upsert({
          where: { volumeId: volume.VolumeId! },
          update: { data: volume as object, syncedAt: now },
          create: {
            volumeId: volume.VolumeId!,
            data: volume as object,
            syncedAt: now,
          },
        }),
      ),
  ]);
}

/** Sync EBS snapshots into cache. */
export async function syncSnapshots() {
  const snapshots = await listSnapshots();
  const now = new Date();

  const currentIds = snapshots
    .map((s) => s.SnapshotId)
    .filter((id): id is string => !!id);

  await prisma.$transaction([
    prisma.cachedSnapshot.deleteMany({
      where: { snapshotId: { notIn: currentIds } },
    }),
    ...snapshots
      .filter((s) => s.SnapshotId)
      .map((snapshot) =>
        prisma.cachedSnapshot.upsert({
          where: { snapshotId: snapshot.SnapshotId! },
          update: { data: snapshot as object, syncedAt: now },
          create: {
            snapshotId: snapshot.SnapshotId!,
            data: snapshot as object,
            syncedAt: now,
          },
        }),
      ),
  ]);
}

/** Get the current sync status. */
export async function getSyncStatus() {
  return prisma.syncStatus.findUnique({ where: { id: 'singleton' } });
}
