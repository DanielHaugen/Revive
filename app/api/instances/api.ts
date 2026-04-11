import {
  DescribeInstancesCommand,
  StartInstancesCommand,
  StopInstancesCommand,
} from '@aws-sdk/client-ec2';
import { NextResponse } from 'next/server';
import { ec2Client } from '@/lib/services/aws';

// Function to fetch instance IDs based on the wildcard '*' or return provided instance IDs
async function getInstanceIds(
  instanceIds: string | string[]
): Promise<string[]> {
  // Ensure the argument is always treated as an array
  const idsArray = Array.isArray(instanceIds) ? instanceIds : [instanceIds];

  if (idsArray.includes('*')) {
    try {
      // Fetch all instances using DescribeInstances
      const describeCommand = new DescribeInstancesCommand({});
      const describeResponse = await ec2Client.send(describeCommand);

      // Collect all instance IDs from the response
      const finalInstanceIds =
        describeResponse.Reservations?.flatMap(
          (reservation) =>
            reservation.Instances?.map(
              (instance) => instance.InstanceId
            ).filter((id): id is string => !!id) || []
        ) || [];

      if (finalInstanceIds.length === 0) {
        throw new Error('No instances found to process.');
      }

      return finalInstanceIds;
    } catch (error) {
      console.error('Error describing instances:', error);
      throw new Error('Failed to fetch instance IDs');
    }
  }

  return idsArray;
}

// Start Instances Route
export async function startInstances(instanceIds: string | string[]) {
  try {
    const finalInstanceIds = await getInstanceIds(instanceIds);

    // Prepare the StartInstances command
    const startInstancesCommand = new StartInstancesCommand({
      InstanceIds: finalInstanceIds, // Start instances by resolved IDs
    });

    // Send the command to EC2
    const data = await ec2Client.send(startInstancesCommand);

    return NextResponse.json({
      message: `Instances are starting: ${finalInstanceIds.join(', ')}`,
      data: data.StartingInstances,
    });
  } catch (error) {
    console.error('Error starting EC2 instances:', error);
    return NextResponse.json(
      { message: 'Error starting instances', error: String(error) },
      { status: 500 }
    );
  }
}

// Stop Instances Route (new code for stopping instances)
export async function stopInstances(instanceIds: string | string[]) {
  try {
    const finalInstanceIds = await getInstanceIds(instanceIds);

    // Prepare the StopInstances command
    const stopInstancesCommand = new StopInstancesCommand({
      InstanceIds: finalInstanceIds, // Stop instances by resolved IDs
    });

    // Send the command to EC2
    const data = await ec2Client.send(stopInstancesCommand);

    return NextResponse.json({
      message: `Instances are stopping: ${finalInstanceIds.join(', ')}`,
      data: data.StoppingInstances,
    });
  } catch (error) {
    console.error('Error stopping EC2 instances:', error);
    return NextResponse.json(
      { message: 'Error stopping instances', error: String(error) },
      { status: 500 }
    );
  }
}
