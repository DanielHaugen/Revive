import { NextResponse } from 'next/server';
import { tagResources, untagResources } from '@/lib/services/tags';
import { syncVolumes } from '@/lib/services/sync';
import { validateBody, validateParam } from '@/lib/validation/helpers';
import { awsVolumeIdSchema, resourceTagsSchema } from '@/lib/validation/schemas';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const paramResult = validateParam(params.id, awsVolumeIdSchema);
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

    syncVolumes().catch((e) => console.error('Post-tag volume sync failed:', e));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tagging volume:', error);
    return NextResponse.json(
      { error: 'Failed to update volume tags' },
      { status: 500 }
    );
  }
}
