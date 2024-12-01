import { NextResponse } from 'next/server';
import { EC2Client, DescribeInstancesCommand } from '@aws-sdk/client-ec2';

// Initialize the EC2 client
const ec2Client = new EC2Client({ region: 'us-east-1' }); // Update with your AWS region

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // Prepare the DescribeInstances command
    const describeInstancesCommand = new DescribeInstancesCommand({
      InstanceIds: [id], // Specify the instance ID
    });

    // Send the command to EC2
    const data = await ec2Client.send(describeInstancesCommand);

    if (
      !data.Reservations ||
      data.Reservations.length === 0 ||
      !data.Reservations[0].Instances ||
      data.Reservations[0].Instances.length === 0
    ) {
      return NextResponse.json(
        { message: 'Instance not found' },
        { status: 404 }
      );
    }

    const instance = data.Reservations[0]?.Instances[0];

    // Return the instance metadata as a JSON response
    return NextResponse.json(instance);
  } catch (error) {
    console.error('Error fetching EC2 instance data:', error);
    return NextResponse.json(
      { message: 'Error fetching instance data' },
      { status: 500 }
    );
  }
}
