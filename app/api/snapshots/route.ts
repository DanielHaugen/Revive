import { NextResponse } from 'next/server';
import { listSnapshots } from '@/lib/services/snapshots';
import { getCachedSnapshots, isCachePopulated } from '@/lib/services/cache';
import { syncSnapshots } from '@/lib/services/sync';

export async function GET() {
  try {
    if (await isCachePopulated()) {
      const snapshots = await getCachedSnapshots();
      return NextResponse.json(snapshots);
    }

    const snapshots = await listSnapshots();
    syncSnapshots().catch((e) => console.error('Background snapshot sync failed:', e));
    return NextResponse.json(snapshots);
  } catch (error) {
    console.error('Error fetching EBS snapshots:', error);
    return NextResponse.json(
      { error: 'Error fetching EBS snapshots' },
      { status: 500 }
    );
  }
}
