import { NextResponse } from 'next/server';
import { getInstance } from '@/lib/services/instances';
import { getCachedInstance, isCachePopulated } from '@/lib/services/cache';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // Serve from cache if populated
    if (await isCachePopulated()) {
      const instance = await getCachedInstance(id);
      if (!instance) {
        return NextResponse.json(
          { error: 'Instance not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(instance);
    }

    // Fallback to direct AWS call
    const instance = await getInstance(id);

    if (!instance) {
      return NextResponse.json(
        { error: 'Instance not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(instance);
  } catch (error) {
    console.error('Error fetching EC2 instance data:', error);
    return NextResponse.json(
      { error: 'Error fetching instance data' },
      { status: 500 }
    );
  }
}
