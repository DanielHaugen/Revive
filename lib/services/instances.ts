import {
  DescribeInstancesCommand,
  StartInstancesCommand,
  StopInstancesCommand,
} from '@aws-sdk/client-ec2';
import { ec2Client } from '@/lib/services/aws';

/**
 * Resolves instance IDs. If '*' is passed, fetches all instance IDs.
 */
async function resolveInstanceIds(
  instanceIds: string | string[]
): Promise<string[]> {
  const ids = Array.isArray(instanceIds) ? instanceIds : [instanceIds];

  if (!ids.includes('*')) return ids;

  const command = new DescribeInstancesCommand({});
  const response = await ec2Client.send(command);

  const allIds =
    response.Reservations?.flatMap(
      (r) =>
        r.Instances?.map((i) => i.InstanceId).filter(
          (id): id is string => !!id
        ) || []
    ) || [];

  if (allIds.length === 0) {
    throw new Error('No instances found to process.');
  }

  return allIds;
}

/** List all EC2 instances. */
export async function listInstances() {
  const command = new DescribeInstancesCommand({});
  const response = await ec2Client.send(command);

  return (
    response.Reservations?.flatMap((r) => r.Instances || []) || []
  );
}

/** Get a single EC2 instance by ID. Returns null if not found. */
export async function getInstance(instanceId: string) {
  const command = new DescribeInstancesCommand({
    InstanceIds: [instanceId],
  });
  const response = await ec2Client.send(command);

  return response.Reservations?.[0]?.Instances?.[0] ?? null;
}

/** Start one or more instances. Supports '*' wildcard. */
export async function startInstances(instanceIds: string | string[]) {
  const ids = await resolveInstanceIds(instanceIds);
  const command = new StartInstancesCommand({ InstanceIds: ids });
  const response = await ec2Client.send(command);

  return {
    instanceIds: ids,
    startingInstances: response.StartingInstances,
  };
}

/** Stop one or more instances. Supports '*' wildcard. */
export async function stopInstances(instanceIds: string | string[]) {
  const ids = await resolveInstanceIds(instanceIds);
  const command = new StopInstancesCommand({ InstanceIds: ids });
  const response = await ec2Client.send(command);

  return {
    instanceIds: ids,
    stoppingInstances: response.StoppingInstances,
  };
}
