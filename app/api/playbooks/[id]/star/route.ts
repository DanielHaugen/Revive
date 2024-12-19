import prisma from '@/lib/prisma'; // Make sure this path matches your Prisma setup
import { NextResponse } from 'next/server';

// PUT: Toggle the "starred" status of a playbook
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const playbookId = parseInt(params.id, 10);
  if (isNaN(playbookId)) {
    return NextResponse.json({ error: 'Invalid playbook ID' }, { status: 400 });
  }

  try {
    // Fetch the current playbook to check its status
    const playbook = await prisma.playbook.findUnique({
      where: { id: playbookId },
    });

    if (!playbook) {
      return NextResponse.json(
        { error: 'Playbook not found' },
        { status: 404 }
      );
    }

    // Toggle the "starred" status (Assuming "starred" is a boolean in your schema)
    const updatedPlaybook = await prisma.playbook.update({
      where: { id: playbookId },
      data: { starred: !playbook.starred },
    });

    return NextResponse.json(updatedPlaybook, { status: 200 });
  } catch (error) {
    console.error('Error toggling playbook starred status:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
