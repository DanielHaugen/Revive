import { NextResponse } from 'next/server';
import { togglePlaybookStar } from '@/lib/services/playbooks';
import { validateParam } from '@/lib/validation/helpers';
import { playbookIdSchema } from '@/lib/validation/schemas';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const v = validateParam(params.id, playbookIdSchema);
  if (v.error) return v.error;

  try {
    const playbook = await togglePlaybookStar(v.data);

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
