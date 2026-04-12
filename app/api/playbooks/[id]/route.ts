import { NextResponse } from 'next/server';
import {
  getPlaybook,
  deletePlaybook,
  updatePlaybook,
} from '@/lib/services/playbooks';
import { validateBody } from '@/lib/validation/helpers';
import { playbookIdSchema, playbookBodySchema } from '@/lib/validation/schemas';

function parsePlaybookId(id: string) {
  const result = playbookIdSchema.safeParse(id);
  return result.success ? result.data : null;
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const playbookId = parsePlaybookId(params.id);
  if (!playbookId) {
    return NextResponse.json({ error: 'Invalid playbook ID' }, { status: 400 });
  }

  try {
    const playbook = await getPlaybook(playbookId);
    if (!playbook) {
      return NextResponse.json({ error: 'Playbook not found' }, { status: 404 });
    }
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
  const playbookId = parsePlaybookId(params.id);
  if (!playbookId) {
    return NextResponse.json({ error: 'Invalid playbook ID' }, { status: 400 });
  }

  try {
    await deletePlaybook(playbookId);
    return NextResponse.json({ message: 'Playbook deleted successfully' });
  } catch (error) {
    console.error('Error deleting playbook:', error);
    return NextResponse.json(
      { error: 'Failed to delete playbook' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const playbookId = parsePlaybookId(params.id);
  if (!playbookId) {
    return NextResponse.json({ error: 'Invalid playbook ID' }, { status: 400 });
  }

  try {
    const result = await validateBody(req, playbookBodySchema);
    if (result.error) return result.error;
    const { name, description, steps } = result.data;

    const playbook = await updatePlaybook(playbookId, { name, description, steps });
    return NextResponse.json(playbook);
  } catch (error) {
    console.error('Error updating playbook:', error);
    return NextResponse.json(
      { error: 'Failed to update playbook' },
      { status: 500 }
    );
  }
}
