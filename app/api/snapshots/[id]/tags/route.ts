import { NextResponse } from 'next/server';
import { tagSnapshot } from '@/lib/services/snapshots';
import { tagResources, untagResources } from '@/lib/services/tags';
import { syncSnapshots } from '@/lib/services/sync';
import { validateBody, validateParam } from '@/lib/validation/helpers';
import { awsSnapshotIdSchema, snapshotTagsSchema, resourceTagsSchema } from '@/lib/validation/schemas';

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

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const paramResult = validateParam(params.id, awsSnapshotIdSchema);
  if (paramResult.error) return paramResult.error;

  const bodyResult = await validateBody(req, resourceTagsSchema);
  if (bodyResult.error) return bodyResult.error;

  try {
    const { tags, deleteTags } = bodyResult.data;

    if (deleteTags && deleteTags.length > 0) {
      await untagResources([paramResult.data], deleteTags);
    }
    if (tags && tags.length > 0) {
      await tagResources([paramResult.data], tags);
    }

    syncSnapshots().catch((e) => console.error('Post-tag snapshot sync failed:', e));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tagging snapshot:', error);
    return NextResponse.json(
      { error: 'Failed to update snapshot tags' },
      { status: 500 }
    );
  }
}
