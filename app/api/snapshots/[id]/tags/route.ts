import { NextResponse } from 'next/server';
import { tagSnapshot } from '@/lib/services/snapshots';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { tags } = await req.json();

  try {
    await tagSnapshot(params.id, tags);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tagging snapshot:', error);
    return NextResponse.json(
      { error: 'Failed to tag snapshot' },
      { status: 500 }
    );
  }
}
