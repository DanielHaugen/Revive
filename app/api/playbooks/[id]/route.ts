import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // Parse the ID to ensure it's a valid number
    const playbookId = parseInt(id, 10);
    if (isNaN(playbookId)) {
      return NextResponse.json(
        { error: 'Invalid playbook ID' },
        { status: 400 }
      );
    }

    // Fetch the playbook with its associated steps and targets
    const playbook = await prisma.playbook.findUnique({
      where: { id: playbookId },
      include: {
        steps: {
          include: {
            targets: true, // Include related targets for each step
          },
        },
      },
    });

    // Handle case where playbook is not found
    if (!playbook) {
      return NextResponse.json(
        { error: 'Playbook not found' },
        { status: 404 }
      );
    }

    // Return the playbook data
    return NextResponse.json({ playbook });
  } catch (error) {
    console.error('Error fetching playbook details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playbook details' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const playbookId = parseInt(id, 10);

    if (isNaN(playbookId)) {
      return NextResponse.json(
        { message: 'Invalid playbook ID' },
        { status: 400 }
      );
    }

    await prisma.playbook.delete({
      where: { id: playbookId },
    });

    return NextResponse.json(
      { message: 'Playbook deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting playbook:', error);
    return NextResponse.json(
      { message: 'Failed to delete playbook' },
      { status: 500 }
    );
  }
}
