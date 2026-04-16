import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSyncConfig, updateSyncConfig } from '@/lib/services/sync';

/** GET /api/sync/config — return current auto-sync configuration. */
export async function GET() {
  const config = await getSyncConfig();
  return NextResponse.json(config);
}

const patchSchema = z.object({
  autoSyncEnabled: z.boolean().optional(),
  autoSyncIntervalSecs: z.number().int().min(10).max(3600).optional(),
});

/** PATCH /api/sync/config — update auto-sync configuration. */
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const config = await updateSyncConfig(parsed.data);
  return NextResponse.json(config);
}
