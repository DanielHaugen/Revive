import {
  EC2Client,
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

const ec2Client = new EC2Client({
  region: process.env.AWS_REGION || 'us-east-1',
});

export async function GET(
  request: Request,
  { params }: { params: { id: string; snapId: string } }
) {
  const stream = new ReadableStream({
    async start(controller) {
      const sendProgress = (message: string) => {
        controller.enqueue(`data: ${message}\n\n`);
      };

      const instanceId = params.id;
      const snapshotId = params.snapId;

      try {
        // Step 1: Stop the instance
        sendProgress(`Stopping instance ${instanceId}...`);
        await ec2Client.send(
          new StopInstancesCommand({ InstanceIds: [instanceId] })
        );
        await waitUntilInstanceStopped(
          { client: ec2Client, maxWaitTime: 300 },
          { InstanceIds: [instanceId] }
        );
        sendProgress(`Instance ${instanceId} stopped.`);

        // Step 2: Get instance availability zone and original volume details
        const describeResponse = await ec2Client.send(
          new DescribeInstancesCommand({ InstanceIds: [instanceId] })
        );

        const instance = describeResponse.Reservations?.[0]?.Instances?.[0];
        const availabilityZone = instance?.Placement?.AvailabilityZone;

        // Attempt to retrieve the original volume ID (it may be missing)
        const originalVolumeId =
          instance?.BlockDeviceMappings?.[0]?.Ebs?.VolumeId;

        if (!availabilityZone) {
          throw new Error('Could not retrieve instance availability zone');
        }
        sendProgress(`Retrieved availability zone: ${availabilityZone}`);

        // Step 3: Create a new volume from the snapshot
        sendProgress(`Creating new volume from snapshot ${snapshotId}...`);
        const createVolumeResponse = await ec2Client.send(
          new CreateVolumeCommand({
            SnapshotId: snapshotId,
            AvailabilityZone: availabilityZone,
          })
        );
        const newVolumeId = createVolumeResponse.VolumeId;
        if (!newVolumeId) {
          throw new Error('Failed to create volume: VolumeId is undefined');
        }
        sendProgress(`New volume ${newVolumeId} created.`);

        // Step 4: Detach the original volume only if it exists
        if (originalVolumeId) {
          const volumeDetails = await ec2Client.send(
            new DescribeVolumesCommand({ VolumeIds: [originalVolumeId] })
          );
          const originalVolumeState = volumeDetails.Volumes?.[0]?.State;

          if (originalVolumeState === 'in-use') {
            sendProgress(`Detaching original volume ${originalVolumeId}...`);
            await ec2Client.send(
              new DetachVolumeCommand({
                VolumeId: originalVolumeId,
                InstanceId: instanceId,
              })
            );
            await waitUntilVolumeAvailable(
              { client: ec2Client, maxWaitTime: 300 },
              { VolumeIds: [originalVolumeId] }
            );
            sendProgress(`Original volume ${originalVolumeId} detached.`);
          } else {
            sendProgress(
              `Original volume ${originalVolumeId} already detached.`
            );
          }
        } else {
          sendProgress(
            'No original volume found to detach. Proceeding with new volume attachment.'
          );
        }

        // Step 5: Wait for the new volume to be available before attaching
        sendProgress(
          `Waiting for new volume ${newVolumeId} to be available...`
        );
        await waitUntilVolumeAvailable(
          { client: ec2Client, maxWaitTime: 300 },
          { VolumeIds: [newVolumeId] }
        );
        sendProgress(`New volume ${newVolumeId} is available.`);

        // Step 6: Attach the new volume
        sendProgress(`Attaching new volume ${newVolumeId}...`);
        await ec2Client.send(
          new AttachVolumeCommand({
            VolumeId: newVolumeId!,
            InstanceId: instanceId,
            Device: '/dev/xvda',
          })
        );
        await waitUntilVolumeInUse(
          { client: ec2Client, maxWaitTime: 300 },
          { VolumeIds: [newVolumeId!] }
        );
        sendProgress(
          `New volume ${newVolumeId} attached to instance ${instanceId}.`
        );

        // Step 7: Start the instance
        sendProgress(`Starting instance ${instanceId}...`);
        await ec2Client.send(
          new StartInstancesCommand({ InstanceIds: [instanceId] })
        );
        sendProgress(`Instance ${instanceId} started.`);

        sendProgress('Restoration complete.');
      } catch (error) {
        sendProgress(`Error: ${(error as Error).message}`);
      } finally {
        controller.close(); // Close the stream
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
