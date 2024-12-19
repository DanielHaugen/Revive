import { CreateTagsCommand, EC2Client } from '@aws-sdk/client-ec2';
import { NextResponse } from 'next/server';

const ec2Client = new EC2Client({ region: process.env.AWS_REGION });

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const snapshotId = params.id;
  const { tags } = await req.json();

  try {
    const command = new CreateTagsCommand({
      Resources: [snapshotId],
      Tags: tags,
    });
    await ec2Client.send(command);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tagging snapshot:', error);
    return NextResponse.json(
      { error: 'Failed to tag snapshot' },
      { status: 500 }
    );
  }
}
