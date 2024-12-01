import { NextResponse } from 'next/server';
import { EC2Client, DescribeInstancesCommand } from '@aws-sdk/client-ec2';

// Set up the EC2 client using system AWS profile credentials
const ec2Client = new EC2Client({
  region: process.env.AWS_REGION || 'us-east-1',
});

export async function GET() {
  try {
    // Fetch the list of instances
    const command = new DescribeInstancesCommand({});
    const response = await ec2Client.send(command);

    // Extract instances from the response
    const instances =
      response.Reservations?.flatMap(
        (reservation) => reservation.Instances || []
      ) || [];

    // Return the instances as a JSON response
    return NextResponse.json(instances);
  } catch (error) {
    console.error('Error fetching EC2 instances:', error);
    return NextResponse.json(
      { error: 'Error fetching EC2 instances' },
      { status: 500 }
    );
  }
}
