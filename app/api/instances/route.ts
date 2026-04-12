import { NextResponse } from 'next/server';
import { listInstances } from '@/lib/services/instances';
import { getCachedInstances, isCachePopulated } from '@/lib/services/cache';
import { syncInstances } from '@/lib/services/sync';

export async function GET() {
  try {
    // Serve from cache if populated
    if (await isCachePopulated()) {
      const instances = await getCachedInstances();
      return NextResponse.json(instances);
    }

    // First request: fetch directly, populate cache in background
    const instances = await listInstances();
    syncInstances().catch((e) => console.error('Background instance sync failed:', e));
    return NextResponse.json(instances);
  } catch (error) {
    console.error('Error fetching EC2 instances:', error);
    return NextResponse.json(
      { error: 'Error fetching EC2 instances' },
      { status: 500 }
    );
  }
}
