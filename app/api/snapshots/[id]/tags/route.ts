import { NextResponse } from 'next/server';
import { tagSnapshot } from '@/lib/services/snapshots';
import { syncSnapshots } from '@/lib/services/sync';
import { validateBody, validateParam } from '@/lib/validation/helpers';
import { awsSnapshotIdSchema, snapshotTagsSchema } from '@/lib/validation/schemas';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const paramResult = validateParam(params.id, awsSnapshotIdSchema);
  if (paramResult.error) return paramResult.error;

  const bodyResult = await validateBody(req, snapshotTagsSchema);
  if (bodyResult.error) return bodyResult.error;

  try {
    await tagSnapshot(paramResult.data, bodyResult.data.tags);
    syncSnapshots().catch((e) => console.error('Post-tag snapshot sync failed:', e));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tagging snapshot:', error);
    return NextResponse.json(
      { error: 'Failed to tag snapshot' },
      { status: 500 }
    );
  }
}
