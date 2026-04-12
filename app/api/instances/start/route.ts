import { NextResponse } from 'next/server';
import { startInstances } from '@/lib/services/instances';
import { syncInstances } from '@/lib/services/sync';
import { validateBody } from '@/lib/validation/helpers';
import { instanceIdsSchema } from '@/lib/validation/schemas';

export async function POST(request: Request) {
  const result = await validateBody(request, instanceIdsSchema);
  if (result.error) return result.error;
  const { instanceIds } = result.data;

  try {
    const result = await startInstances(instanceIds);
    syncInstances().catch((e) => console.error('Post-start sync failed:', e));
    return NextResponse.json({
      message: `Instances are starting: ${result.instanceIds.join(', ')}`,
      data: result.startingInstances,
    });
  } catch (error) {
    console.error('Error starting instances:', error);
    return NextResponse.json(
      { error: 'Error starting instances' },
      { status: 500 }
    );
  }
}
