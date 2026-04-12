import { NextResponse } from 'next/server';
import { listPlaybooks } from '@/lib/services/playbooks';

export async function GET() {
  try {
    const playbooks = await listPlaybooks();
    return NextResponse.json(playbooks);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching playbooks' },
      { status: 500 }
    );
  }
}
