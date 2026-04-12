import { NextResponse } from 'next/server';
import { startInstances } from '@/lib/services/instances';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await startInstances(params.id);
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
