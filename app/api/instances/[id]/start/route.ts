import { EC2Client, StartInstancesCommand } from '@aws-sdk/client-ec2';
import { NextResponse } from 'next/server';

// Initialize the EC2 client
const ec2Client = new EC2Client({ region: 'us-east-1' }); // Update with your AWS region

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // Prepare the StartInstances command
    const startInstancesCommand = new StartInstancesCommand({
      InstanceIds: [id], // Start a single instance by ID
    });

    // Send the command to EC2
    const data = await ec2Client.send(startInstancesCommand);

    // If the operation is successful, return a success response
    return NextResponse.json({
      message: `Instance ${id} is starting.`,
      data: data.StartingInstances,
    });
  } catch (error) {
    console.error('Error starting EC2 instance:', error);
    return NextResponse.json(
      { message: 'Error starting instance' },
      { status: 500 }
    );
  }
}
