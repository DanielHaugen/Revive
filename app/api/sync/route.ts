import { NextResponse } from 'next/server';
import { getSyncStatus, syncAll } from '@/lib/services/sync';
import prisma from '@/lib/prisma';

const STUCK_SYNC_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes

/** GET /api/sync — return current sync status. Auto-resets a stuck inProgress flag. */
export async function GET() {
  let status = await getSyncStatus();

  // If inProgress has been true for >2 min, the process was likely killed mid-sync.
  if (
    status?.inProgress &&
    status.updatedAt &&
    Date.now() - new Date(status.updatedAt).getTime() > STUCK_SYNC_THRESHOLD_MS
  ) {
    status = await prisma.syncStatus.update({
      where: { id: 'singleton' },
      data: { inProgress: false, lastError: 'Sync interrupted — previous run did not complete.' },
    });
  }

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
