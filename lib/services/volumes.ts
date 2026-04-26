import {
  AttachVolumeCommand,
  CreateVolumeCommand,
  DescribeVolumesCommand,
  DescribeVolumesCommandInput,
  DeleteVolumeCommand,
  DetachVolumeCommand,
  Volume,
  type VolumeType,
} from '@aws-sdk/client-ec2';
import { ec2Client, paginate } from '@/lib/services/aws';

/** List all EBS volumes with pagination. Optionally filter by ID. */
export async function listVolumes(volumeId?: string) {
  return paginate<Volume, { NextToken?: string; Volumes?: Volume[] }>(
    (nextToken) => {
      const input: DescribeVolumesCommandInput = {
        NextToken: nextToken,
        VolumeIds: volumeId ? [volumeId] : undefined,
      };
      return ec2Client.send(new DescribeVolumesCommand(input));
    },
    'Volumes',
  );
}

/** Get a single volume by ID. Returns null if not found. */
export async function getVolume(volumeId: string) {
  const volumes = await listVolumes(volumeId);
  return volumes[0] ?? null;
}

/** Delete one or more volumes by ID. */
export async function deleteVolumes(volumeIds: string | string[]) {
  const ids = Array.isArray(volumeIds) ? volumeIds : [volumeIds];

  if (ids.length === 0) {
    throw new Error('No volume IDs provided for deletion');
  }

  await Promise.all(
    ids.map((id) =>
      ec2Client.send(new DeleteVolumeCommand({ VolumeId: id }))
    )
  );
}

/** Create an EBS volume. */
export async function createVolume(params: {
  availabilityZone: string;
  size: number;
  volumeType: string;
}) {
  const command = new CreateVolumeCommand({
    AvailabilityZone: params.availabilityZone,
    Size: params.size,
    VolumeType: params.volumeType as VolumeType,
  });
  return ec2Client.send(command);
}

/** Attach a volume to an instance. */
export async function attachVolume(volumeId: string, instanceId: string, device: string) {
  const command = new AttachVolumeCommand({
    VolumeId: volumeId,
    InstanceId: instanceId,
    Device: device,
  });
  return ec2Client.send(command);
}

/** Detach a volume from an instance. */
export async function detachVolume(volumeId: string) {
  const command = new DetachVolumeCommand({
    VolumeId: volumeId,
  });
  return ec2Client.send(command);
}
