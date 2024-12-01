// app/api/instances/[id]/stop/route.ts

import { EC2Client, StopInstancesCommand } from '@aws-sdk/client-ec2';
import { NextResponse } from 'next/server';

// Initialize the EC2 client
const ec2Client = new EC2Client({ region: 'us-east-1' }); // Update with your AWS region

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // Prepare the StopInstances command
    const stopInstancesCommand = new StopInstancesCommand({
      InstanceIds: [id], // Stop a single instance by ID
    });

    // Send the command to EC2
    const data = await ec2Client.send(stopInstancesCommand);

    // If the operation is successful, return a success response
    return NextResponse.json({
      message: `Instance ${id} is stopping.`,
      data: data.StoppingInstances,
    });
  } catch (error) {
    console.error('Error stopping EC2 instance:', error);
    return NextResponse.json(
      { message: 'Error stopping instance' },
      { status: 500 }
    );
  }
}
