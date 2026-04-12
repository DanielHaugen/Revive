import { NextResponse } from 'next/server';
import { rebootInstances } from '@/lib/services/instances';
import { syncInstances } from '@/lib/services/sync';
import { validateBody } from '@/lib/validation/helpers';
import { instanceIdsSchema } from '@/lib/validation/schemas';

export async function POST(request: Request) {
  const result = await validateBody(request, instanceIdsSchema);
  if (result.error) return result.error;
  const { instanceIds } = result.data;

  try {
    const result = await rebootInstances(instanceIds);
    syncInstances().catch((e) => console.error('Post-reboot sync failed:', e));
    return NextResponse.json({
      message: `Instances are rebooting: ${result.instanceIds.join(', ')}`,
    });
  } catch (error) {
    console.error('Error rebooting instances:', error);
    return NextResponse.json(
      { error: 'Error rebooting instances' },
      { status: 500 }
    );
  }
}
