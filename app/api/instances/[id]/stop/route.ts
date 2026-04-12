import { NextResponse } from 'next/server';
import { stopInstances } from '@/lib/services/instances';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await stopInstances(params.id);
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
