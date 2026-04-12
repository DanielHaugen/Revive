import { NextResponse } from 'next/server';
import { listVolumes } from '@/lib/services/volumes';

export async function GET() {
  try {
    const volumes = await listVolumes();
    return NextResponse.json(volumes);
  } catch (error) {
    console.error('Error fetching EBS volumes:', error);
    return NextResponse.json(
      { error: 'Error fetching EBS volumes' },
      { status: 500 }
    );
  }
}
