import { NextResponse } from 'next/server';
import {
  EC2Client,
  DescribeSnapshotsCommand,
  DescribeSnapshotsCommandInput,
  DescribeSnapshotsCommandOutput,
} from '@aws-sdk/client-ec2';

// Initialize the EC2 client
const ec2Client = new EC2Client({
  region: process.env.AWS_REGION || 'us-east-1',
});

export async function GET() {
  try {
    const snapshots: DescribeSnapshotsCommandOutput['Snapshots'] = []; // Correct type for snapshots array
    let nextToken: string | undefined = undefined;

    do {
      // Explicitly define the input type
      const input: DescribeSnapshotsCommandInput = {
        NextToken: nextToken,
        OwnerIds: ['self'], // Optional: Limit to your account's snapshots
      };

      // Explicitly type the command
      const command: DescribeSnapshotsCommand = new DescribeSnapshotsCommand(
        input
      );

      // Send the command to AWS and type the response
      const response: DescribeSnapshotsCommandOutput = await ec2Client.send(
        command
      );

      // Safely append snapshots if they exist
      if (response.Snapshots) {
        snapshots.push(...response.Snapshots);
      }

      nextToken = response.NextToken; // Prepare nextToken for the next iteration
    } while (nextToken); // Continue fetching until no more pages

    // Return combined snapshots as JSON
    return NextResponse.json(snapshots);
  } catch (error) {
    console.error('Error fetching EBS snapshots:', error);
    return NextResponse.json(
      { error: 'Error fetching EBS snapshots' },
      { status: 500 }
    );
  }
}
