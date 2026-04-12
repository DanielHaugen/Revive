import { NextResponse } from 'next/server';
import { stopInstances } from '@/lib/services/instances';

export async function POST(request: Request) {
  const { instanceIds }: { instanceIds: string[] } = await request.json();

  if (!Array.isArray(instanceIds) || instanceIds.length === 0) {
    return NextResponse.json(
      { error: 'Instance IDs are required and must be a non-empty array.' },
      { status: 400 }
    );
  }

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
