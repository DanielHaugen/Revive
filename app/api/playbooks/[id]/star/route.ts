import { NextResponse } from 'next/server';
import { togglePlaybookStar } from '@/lib/services/playbooks';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const playbookId = parseInt(params.id, 10);
  if (isNaN(playbookId)) {
    return NextResponse.json({ error: 'Invalid playbook ID' }, { status: 400 });
  }

  try {
    const playbook = await togglePlaybookStar(playbookId);

    if (!playbook) {
      return NextResponse.json(
        { error: 'Playbook not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(playbook);
  } catch (error) {
    console.error('Error toggling playbook starred status:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
