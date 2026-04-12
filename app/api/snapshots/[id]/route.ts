import { NextResponse } from 'next/server';
import { getSnapshot } from '@/lib/services/snapshots';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const snapshot = await getSnapshot(id);

    if (!snapshot) {
      return NextResponse.json(
        { error: `No snapshot found with ID ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json(snapshot);
  } catch (error) {
    console.error(`Error fetching snapshot with ID ${id}:`, error);
    return NextResponse.json(
      { error: `Error fetching snapshot with ID ${id}` },
      { status: 500 }
    );
  }
}
