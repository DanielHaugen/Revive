import { NextResponse } from 'next/server';
import { startInstances } from '@/lib/services/instances';

export async function POST(request: Request) {
  const { instanceIds }: { instanceIds: string[] } = await request.json();

  if (!Array.isArray(instanceIds) || instanceIds.length === 0) {
    return NextResponse.json(
      { error: 'Instance IDs are required and must be a non-empty array.' },
      { status: 400 }
    );
  }

  try {
    const result = await startInstances(instanceIds);
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
