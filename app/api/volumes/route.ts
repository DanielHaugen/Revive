import { NextResponse } from 'next/server';
import { listVolumes, createVolume } from '@/lib/services/volumes';
import { getCachedVolumes, isCachePopulated } from '@/lib/services/cache';
import { syncVolumes } from '@/lib/services/sync';
import { validateBody } from '@/lib/validation/helpers';
import { createVolumeSchema } from '@/lib/validation/schemas';

export async function GET() {
  try {
    if (await isCachePopulated()) {
      const volumes = await getCachedVolumes();
      return NextResponse.json(volumes);
    }

    const volumes = await listVolumes();
    syncVolumes().catch((e) => console.error('Background volume sync failed:', e));
    return NextResponse.json(volumes);
  } catch (error) {
    console.error('Error fetching EBS volumes:', error);
    return NextResponse.json(
      { error: 'Error fetching EBS volumes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const result = await validateBody(request, createVolumeSchema);
  if (result.error) return result.error;

  try {
    const volume = await createVolume(result.data);
    syncVolumes().catch((e) => console.error('Post-create volume sync failed:', e));
    return NextResponse.json(volume, { status: 201 });
  } catch (error) {
    console.error('Error creating volume:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create volume' },
      { status: 500 }
    );
  }
}
