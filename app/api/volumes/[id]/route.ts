// app/api/volumes/[id]/route.ts

import { NextResponse } from 'next/server';
import { deleteVolume } from '../api';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const volumeId = params.id;

  if (!volumeId) {
    return NextResponse.json(
      { error: 'Volume ID is required' },
      { status: 400 }
    );
  }

  try {
    await deleteVolume(volumeId);
    return NextResponse.json({
      message: `Volume ${volumeId} deleted successfully`,
    });
  } catch (error: any) {
    console.error('Error deleting volume:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete volume' },
      { status: 500 }
    );
  }
}
