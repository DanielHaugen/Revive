import { NextResponse } from 'next/server';
import { getSnapshot, deleteSnapshot } from '@/lib/services/snapshots';
import { syncSnapshots } from '@/lib/services/sync';
import { validateParam } from '@/lib/validation/helpers';
import { awsSnapshotIdSchema } from '@/lib/validation/schemas';

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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const v = validateParam(params.id, awsSnapshotIdSchema);
  if (v.error) return v.error;

  try {
    await deleteSnapshot(v.data);
    syncSnapshots().catch((e) => console.error('Post-delete snapshot sync failed:', e));
    return NextResponse.json({
      message: `Snapshot ${v.data} deleted successfully`,
    });
  } catch (error) {
    console.error('Error deleting snapshot:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete snapshot' },
      { status: 500 }
    );
  }
}
