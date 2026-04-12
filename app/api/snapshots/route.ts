import { NextResponse } from 'next/server';
import { listSnapshots } from '@/lib/services/snapshots';

export async function GET() {
  try {
    const snapshots = await listSnapshots();
    return NextResponse.json(snapshots);
  } catch (error) {
    console.error('Error fetching EBS snapshots:', error);
    return NextResponse.json(
      { error: 'Error fetching EBS snapshots' },
      { status: 500 }
    );
  }
}
