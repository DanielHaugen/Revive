// app/api/instances/stop/route.ts

import { EC2Client, StopInstancesCommand } from '@aws-sdk/client-ec2';
import { NextResponse } from 'next/server';

const ec2Client = new EC2Client({ region: 'us-east-1' }); // Update with your AWS region

export async function POST(request: Request) {
  const { instanceIds }: { instanceIds: string[] } = await request.json();

  try {
    // Prepare the StopInstances command for multiple instance IDs
    const stopInstancesCommand = new StopInstancesCommand({
      InstanceIds: instanceIds, // Stop multiple instances by IDs
    });

    // Send the command to EC2
    const data = await ec2Client.send(stopInstancesCommand);

    return NextResponse.json({
      message: 'Instances are stopping.',
      data: data.StoppingInstances,
    });
  } catch (error) {
    console.error('Error stopping EC2 instances:', error);
    return NextResponse.json(
      { message: 'Error stopping instances' },
      { status: 500 }
    );
  }
}
