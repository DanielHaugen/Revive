import { NextResponse } from 'next/server';
import { stopInstances } from '@/lib/services/instances';
import { validateParam } from '@/lib/validation/helpers';
import { awsInstanceIdSchema } from '@/lib/validation/schemas';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const v = validateParam(params.id, awsInstanceIdSchema);
  if (v.error) return v.error;

  try {
    const result = await stopInstances(v.data);
    return NextResponse.json({
      message: `Instance stopping: ${params.id}`,
      data: result.stoppingInstances,
    });
  } catch (error) {
    console.error('Error stopping instance:', error);
    return NextResponse.json(
      { error: 'Error stopping instance' },
      { status: 500 }
    );
  }
}
