import {
  CreateSnapshotCommand,
  CreateTagsCommand,
  DeleteSnapshotCommand,
  DescribeSnapshotsCommand,
  DescribeSnapshotsCommandInput,
  Tag,
  Snapshot,
} from '@aws-sdk/client-ec2';
import { ec2Client, paginate } from '@/lib/services/aws';

/** List all snapshots owned by the current account. Optionally filter by ID. */
export async function listSnapshots(snapshotId?: string) {
  return paginate<Snapshot, { NextToken?: string; Snapshots?: Snapshot[] }>(
    (nextToken) => {
      const input: DescribeSnapshotsCommandInput = {
        NextToken: nextToken,
        OwnerIds: ['self'],
        SnapshotIds: snapshotId ? [snapshotId] : undefined,
      };
      return ec2Client.send(new DescribeSnapshotsCommand(input));
    },
    'Snapshots',
  );
}

/** Get a single snapshot by ID. Returns null if not found. */
export async function getSnapshot(snapshotId: string) {
  const snapshots = await listSnapshots(snapshotId);
  return snapshots[0] ?? null;
}

/** Add tags to a snapshot. */
export async function tagSnapshot(snapshotId: string, tags: Tag[]) {
  const command = new CreateTagsCommand({
    Resources: [snapshotId],
    Tags: tags,
  });
  await ec2Client.send(command);
}

/** Create a snapshot from a volume. */
export async function createSnapshot(volumeId: string, description?: string) {
  const command = new CreateSnapshotCommand({
    VolumeId: volumeId,
    Description: description,
  });
  return ec2Client.send(command);
}

/** Delete a snapshot by ID. */
export async function deleteSnapshot(snapshotId: string) {
  const command = new DeleteSnapshotCommand({
    SnapshotId: snapshotId,
  });
  await ec2Client.send(command);
}
