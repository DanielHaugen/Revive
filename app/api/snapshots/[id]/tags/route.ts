import { CreateTagsCommand } from '@aws-sdk/client-ec2';
import { NextResponse } from 'next/server';
import { ec2Client } from '@/lib/services/aws';

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
