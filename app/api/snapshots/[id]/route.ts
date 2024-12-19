import { NextResponse } from 'next/server';
import { fetchSnapshots } from '../api';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch the snapshot with the given ID
    const snapshots = await fetchSnapshots(id);

    if (snapshots.length === 0) {
      return NextResponse.json(
        { error: `No snapshot found with ID ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json(snapshots[0]); // Return the specific snapshot
  } catch (error) {
    console.error(`Error fetching snapshot with ID ${params.id}:`, error);
    return NextResponse.json(
      { error: `Error fetching snapshot with ID ${params.id}` },
      { status: 500 }
    );
  }
}
