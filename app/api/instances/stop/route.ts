import { NextResponse } from 'next/server';
import { stopInstances } from '@/lib/services/instances';
import { validateBody } from '@/lib/validation/helpers';
import { instanceIdsSchema } from '@/lib/validation/schemas';

export async function POST(request: Request) {
  const result = await validateBody(request, instanceIdsSchema);
  if (result.error) return result.error;
  const { instanceIds } = result.data;

  try {
    const result = await stopInstances(instanceIds);
    return NextResponse.json({
      message: `Instances are stopping: ${result.instanceIds.join(', ')}`,
      data: result.stoppingInstances,
    });
  } catch (error) {
    console.error('Error stopping instances:', error);
    return NextResponse.json(
      { error: 'Error stopping instances' },
      { status: 500 }
    );
  }
}
