import { NextResponse } from 'next/server';
import { deleteVolumes } from '@/lib/services/volumes';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: 'Volume ID is required' },
      { status: 400 }
    );
  }

  try {
    await deleteVolumes(id);
    return NextResponse.json({
      message: `Volume ${id} deleted successfully`,
    });
  } catch (error) {
    console.error('Error deleting volume:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete volume' },
      { status: 500 }
    );
  }
}
}
