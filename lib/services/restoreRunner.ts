import {
  StopInstancesCommand,
  DescribeInstancesCommand,
  CreateVolumeCommand,
  DetachVolumeCommand,
  AttachVolumeCommand,
  StartInstancesCommand,
  waitUntilInstanceStopped,
  waitUntilVolumeAvailable,
  waitUntilVolumeInUse,
  DescribeVolumesCommand,
} from '@aws-sdk/client-ec2';
import { ec2Client } from './aws';
import { logAudit } from './audit';
import { appendJobStep, completeRestoreJob, failRestoreJob } from './restoreJobs';

export async function runRestoreJob(params: {
  jobId: number;
  instanceId: string;
  instanceName?: string;
  snapshotId: string;
  correlationId: string;
  userId?: number;
}): Promise<void> {
  const { jobId, instanceId, snapshotId, correlationId, userId, instanceName } = params;

  const startedAt = Date.now();

  const addStep = async (message: string) => {
    try {
      await appendJobStep(jobId, message);
    } catch (err) {
      console.error('[restore] Failed to append step:', err);
    }
  };

  await logAudit({
    action: 'restore_started',
    resourceId: instanceId,
    detail: JSON.stringify({ snapshotId, ...(instanceName && { instanceName }) }),
    correlationId,
    userId,
  });

  try {
    // Step 1: Stop the instance
    await addStep(`Stopping instance ${instanceId}...`);
    await ec2Client.send(
      new StopInstancesCommand({ InstanceIds: [instanceId], Force: true }),
    );
    await waitUntilInstanceStopped(
      { client: ec2Client, maxWaitTime: 300 },
      { InstanceIds: [instanceId] },
    );
    await addStep(`Instance ${instanceId} stopped.`);

    // Step 2: Get instance availability zone and original volume details
    const describeResponse = await ec2Client.send(
      new DescribeInstancesCommand({ InstanceIds: [instanceId] }),
    );
    const instance = describeResponse.Reservations?.[0]?.Instances?.[0];
    const availabilityZone = instance?.Placement?.AvailabilityZone;
    const originalVolumeId = instance?.BlockDeviceMappings?.[0]?.Ebs?.VolumeId;

    if (!availabilityZone) throw new Error('Could not retrieve instance availability zone');
    await addStep(`Retrieved availability zone: ${availabilityZone}`);

    // Step 3: Create a new volume from the snapshot
    await addStep(`Creating new volume from snapshot ${snapshotId}...`);
    const createVolumeResponse = await ec2Client.send(
      new CreateVolumeCommand({ SnapshotId: snapshotId, AvailabilityZone: availabilityZone }),
    );
    const newVolumeId = createVolumeResponse.VolumeId;
    if (!newVolumeId) throw new Error('Failed to create volume: VolumeId is undefined');
    await addStep(`New volume ${newVolumeId} created.`);

    // Step 4: Detach the original volume if present and in-use
    if (originalVolumeId) {
      const volumeDetails = await ec2Client.send(
        new DescribeVolumesCommand({ VolumeIds: [originalVolumeId] }),
      );
      const originalVolumeState = volumeDetails.Volumes?.[0]?.State;

      if (originalVolumeState === 'in-use') {
        await addStep(`Detaching original volume ${originalVolumeId}...`);
        await ec2Client.send(
          new DetachVolumeCommand({ VolumeId: originalVolumeId, InstanceId: instanceId }),
        );
        await waitUntilVolumeAvailable(
          { client: ec2Client, maxWaitTime: 300 },
          { VolumeIds: [originalVolumeId] },
        );
        await addStep(`Original volume ${originalVolumeId} detached.`);
      } else {
        await addStep(`Original volume ${originalVolumeId} already detached.`);
      }
    } else {
      await addStep('No original volume found to detach. Proceeding with new volume attachment.');
    }

    // Step 5: Wait for the new volume to be available
    await addStep(`Waiting for new volume ${newVolumeId} to be available...`);
    await waitUntilVolumeAvailable(
      { client: ec2Client, maxWaitTime: 300 },
      { VolumeIds: [newVolumeId] },
    );
    await addStep(`New volume ${newVolumeId} is available.`);

    // Step 6: Attach the new volume
    await addStep(`Attaching new volume ${newVolumeId}...`);
    await ec2Client.send(
      new AttachVolumeCommand({
        VolumeId: newVolumeId,
        InstanceId: instanceId,
        Device: '/dev/xvda',
      }),
    );
    await waitUntilVolumeInUse(
      { client: ec2Client, maxWaitTime: 300 },
      { VolumeIds: [newVolumeId] },
    );
    await addStep(`New volume ${newVolumeId} attached to instance ${instanceId}.`);

    // Step 7: Start the instance
    await addStep(`Starting instance ${instanceId}...`);
    await ec2Client.send(new StartInstancesCommand({ InstanceIds: [instanceId] }));
    await addStep(`Instance ${instanceId} started.`);

    await addStep('Restoration complete.');
    await completeRestoreJob(jobId);
    const ttrSeconds = Math.round((Date.now() - startedAt) / 1000);
    await logAudit({
      action: 'restore_completed',
      resourceId: instanceId,
      detail: JSON.stringify({ snapshotId, newVolumeId, ttrSeconds, ...(instanceName && { instanceName }) }),
      correlationId,
      userId,
    });
  } catch (error) {
    const msg = (error as Error).message;
    await addStep(`Error: ${msg}`);
    await failRestoreJob(jobId);
    await logAudit({
      action: 'restore_failed',
      resourceId: instanceId,
      detail: JSON.stringify({ snapshotId, error: msg, ...(instanceName && { instanceName }) }),
      correlationId,
      userId,
    });
  }
}
