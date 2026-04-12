import { NextResponse } from 'next/server';
import { listInstances } from '@/lib/services/instances';

export async function GET() {
  try {
    const instances = await listInstances();
    return NextResponse.json(instances);
  } catch (error) {
    console.error('Error fetching EC2 instances:', error);
    return NextResponse.json(
      { error: 'Error fetching EC2 instances' },
      { status: 500 }
    );
  }
}
