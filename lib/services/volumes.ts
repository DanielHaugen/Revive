import {
  DescribeVolumesCommand,
  DescribeVolumesCommandInput,
  DeleteVolumeCommand,
  Volume,
} from '@aws-sdk/client-ec2';
import { ec2Client } from '@/lib/services/aws';

/** List all EBS volumes with pagination. */
export async function listVolumes() {
  const volumes: Volume[] = [];
  let nextToken: string | undefined;

  do {
    const input: DescribeVolumesCommandInput = { NextToken: nextToken };
    const response = await ec2Client.send(
      new DescribeVolumesCommand(input)
    );

    if (response.Volumes) {
      volumes.push(...response.Volumes);
    }

    nextToken = response.NextToken;
  } while (nextToken);

  return volumes;
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
