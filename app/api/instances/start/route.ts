// app/api/instances/start/route.ts

import { EC2Client, StartInstancesCommand } from '@aws-sdk/client-ec2';
import { NextResponse } from 'next/server';

const ec2Client = new EC2Client({ region: 'us-east-1' }); // Update with your AWS region

export async function POST(request: Request) {
  const { instanceIds }: { instanceIds: string[] } = await request.json();

  try {
    // Prepare the StartInstances command for multiple instance IDs
    const startInstancesCommand = new StartInstancesCommand({
      InstanceIds: instanceIds, // Start multiple instances by IDs
    });

    // Send the command to EC2
    const data = await ec2Client.send(startInstancesCommand);

    return NextResponse.json({
      message: 'Instances are starting.',
      data: data.StartingInstances,
    });
  } catch (error) {
    console.error('Error starting EC2 instances:', error);
    return NextResponse.json(
      { message: 'Error starting instances' },
      { status: 500 }
    );
  }
}
