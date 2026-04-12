import { NextResponse } from 'next/server';
import { deleteVolumes } from '@/lib/services/volumes';
import { syncVolumes } from '@/lib/services/sync';
import { validateParam } from '@/lib/validation/helpers';
import { awsVolumeIdSchema } from '@/lib/validation/schemas';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const v = validateParam(params.id, awsVolumeIdSchema);
  if (v.error) return v.error;

  try {
    await deleteVolumes(v.data);
    syncVolumes().catch((e) => console.error('Post-delete volume sync failed:', e));
    return NextResponse.json({
      message: `Volume ${v.data} deleted successfully`,
    });
  } catch (error) {
    console.error('Error deleting volume:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete volume' },
      { status: 500 }
    );
  }
}
