import {
  DescribeSnapshotsCommand,
  DescribeSnapshotsCommandInput,
  DescribeSnapshotsCommandOutput,
  EC2Client,
} from '@aws-sdk/client-ec2';

const ec2Client = new EC2Client({
  region: process.env.AWS_REGION || 'us-east-1',
});

export async function fetchSnapshots(snapshotId?: string) {
  const snapshots: DescribeSnapshotsCommandOutput['Snapshots'] = [];
  let nextToken: string | undefined = undefined;

  try {
    do {
      // Define the input for DescribeSnapshots
      const input: DescribeSnapshotsCommandInput = {
        NextToken: nextToken,
        OwnerIds: ['self'], // Optional: Limit to your account's snapshots
        SnapshotIds: snapshotId ? [snapshotId] : undefined, // Filter by snapshotId if provided
      };

      const command = new DescribeSnapshotsCommand(input);
      const response = await ec2Client.send(command);

      if (response.Snapshots) {
        snapshots.push(...response.Snapshots);
      }

      nextToken = response.NextToken;
    } while (nextToken);

    return snapshots;
  } catch (error) {
    console.error('Error fetching snapshots:', error);
    throw new Error(
      snapshotId
        ? `Failed to fetch snapshot with ID ${snapshotId}`
        : 'Failed to fetch snapshots'
    );
  }
}
