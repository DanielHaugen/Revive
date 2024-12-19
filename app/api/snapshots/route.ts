import { NextResponse } from 'next/server';
import { fetchSnapshots } from './api';

export async function GET() {
  try {
    const snapshots = await fetchSnapshots(); // Fetch all snapshots
    return NextResponse.json(snapshots);
  } catch (error) {
    console.error('Error fetching EBS snapshots:', error);
    return NextResponse.json(
      { error: 'Error fetching EBS snapshots' },
      { status: 500 }
    );
  }
}
