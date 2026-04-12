import { NextResponse } from 'next/server';
import { listSnapshots, createSnapshot } from '@/lib/services/snapshots';
import { getCachedSnapshots, isCachePopulated } from '@/lib/services/cache';
import { syncSnapshots } from '@/lib/services/sync';
import { validateBody } from '@/lib/validation/helpers';
import { createSnapshotSchema } from '@/lib/validation/schemas';

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

export async function POST(request: Request) {
  const result = await validateBody(request, createSnapshotSchema);
  if (result.error) return result.error;

  try {
    const snapshot = await createSnapshot(result.data.volumeId, result.data.description);
    syncSnapshots().catch((e) => console.error('Post-create snapshot sync failed:', e));
    return NextResponse.json(snapshot, { status: 201 });
  } catch (error) {
    console.error('Error creating snapshot:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create snapshot' },
      { status: 500 }
    );
  }
}
