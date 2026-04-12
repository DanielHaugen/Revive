import { NextResponse } from 'next/server';
import { getSyncStatus, syncAll } from '@/lib/services/sync';

/** GET /api/sync — return current sync status. */
export async function GET() {
  const status = await getSyncStatus();
  return NextResponse.json(status ?? { lastSyncAt: null, lastError: null, inProgress: false });
}

/** POST /api/sync — trigger an on-demand sync. */
export async function POST() {
  const current = await getSyncStatus();
  if (current?.inProgress) {
    return NextResponse.json(
      { message: 'Sync already in progress' },
      { status: 409 },
    );
  }

  try {
    await syncAll();
    const status = await getSyncStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('Sync failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 },
    );
  }
}
