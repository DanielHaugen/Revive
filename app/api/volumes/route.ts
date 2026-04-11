import { NextResponse } from 'next/server';
import {
  DescribeVolumesCommand,
  DescribeVolumesCommandInput,
  DescribeVolumesCommandOutput,
} from '@aws-sdk/client-ec2';
import { ec2Client } from '@/lib/services/aws';

export async function GET() {
  try {
    const volumes: DescribeVolumesCommandOutput['Volumes'] = []; // Correct type for volumes array
    let nextToken: string | undefined = undefined;

    do {
      // Explicitly define the input type
      const input: DescribeVolumesCommandInput = {
        NextToken: nextToken,
      };

      // Explicitly type the command
      const command: DescribeVolumesCommand = new DescribeVolumesCommand(input);

      // Send the command to AWS and type the response
      const response: DescribeVolumesCommandOutput = await ec2Client.send(
        command
      );

      // Safely append volumes if they exist
      if (response.Volumes) {
        volumes.push(...response.Volumes);
      }

      nextToken = response.NextToken; // Prepare nextToken for the next iteration
    } while (nextToken); // Continue fetching until no more pages

    // Return combined volumes as JSON
    return NextResponse.json(volumes);
  } catch (error) {
    console.error('Error fetching EBS volumes:', error);
    return NextResponse.json(
      { error: 'Error fetching EBS volumes' },
      { status: 500 }
    );
  }
}
