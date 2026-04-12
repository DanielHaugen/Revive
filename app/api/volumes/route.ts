import { NextResponse } from 'next/server';
import { listVolumes } from '@/lib/services/volumes';
import { getCachedVolumes, isCachePopulated } from '@/lib/services/cache';
import { syncVolumes } from '@/lib/services/sync';

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
