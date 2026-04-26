import { NextResponse } from 'next/server';
import { getVolume, deleteVolumes, attachVolume, detachVolume } from '@/lib/services/volumes';
import { syncVolumes } from '@/lib/services/sync';
import { validateParam, validateBody } from '@/lib/validation/helpers';
import { awsVolumeIdSchema, attachVolumeSchema } from '@/lib/validation/schemas';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const v = validateParam(params.id, awsVolumeIdSchema);
  if (v.error) return v.error;

  try {
    const volume = await getVolume(v.data);

    if (!volume) {
      return NextResponse.json(
        { error: `No volume found with ID ${v.data}` },
        { status: 404 }
      );
    }

    return NextResponse.json(volume);
  } catch (error) {
    console.error(`Error fetching volume with ID ${v.data}:`, error);
    return NextResponse.json(
      { error: `Error fetching volume with ID ${v.data}` },
      { status: 500 }
    );
  }
}

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

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const v = validateParam(params.id, awsVolumeIdSchema);
  if (v.error) return v.error;

  const body = await validateBody(request, attachVolumeSchema);
  if (body.error) return body.error;

  try {
    const result = await attachVolume(v.data, body.data.instanceId, body.data.device);
    syncVolumes().catch((e) => console.error('Post-attach volume sync failed:', e));
    return NextResponse.json({
      message: `Volume ${v.data} attaching to ${body.data.instanceId}`,
      data: result,
    });
  } catch (error) {
    console.error('Error attaching volume:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to attach volume' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const v = validateParam(params.id, awsVolumeIdSchema);
  if (v.error) return v.error;

  try {
    const result = await detachVolume(v.data);
    syncVolumes().catch((e) => console.error('Post-detach volume sync failed:', e));
    return NextResponse.json({
      message: `Volume ${v.data} detaching`,
      data: result,
    });
  } catch (error) {
    console.error('Error detaching volume:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to detach volume' },
      { status: 500 }
    );
  }
}
