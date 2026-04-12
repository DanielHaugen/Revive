import { NextResponse } from 'next/server';
import { startInstances } from '@/lib/services/instances';
import { validateParam } from '@/lib/validation/helpers';
import { awsInstanceIdSchema } from '@/lib/validation/schemas';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const v = validateParam(params.id, awsInstanceIdSchema);
  if (v.error) return v.error;

  try {
    const result = await startInstances(v.data);
    return NextResponse.json({
      message: `Instance starting: ${params.id}`,
      data: result.startingInstances,
    });
  } catch (error) {
    console.error('Error starting instance:', error);
    return NextResponse.json(
      { error: 'Error starting instance' },
      { status: 500 }
    );
  }
}
