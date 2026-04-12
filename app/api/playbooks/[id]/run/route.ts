import { NextResponse } from 'next/server';
import { runPlaybook } from '@/lib/services/playbooks';
import { validateParam } from '@/lib/validation/helpers';
import { playbookIdSchema } from '@/lib/validation/schemas';

// POST /api/playbooks/[id]/run
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const v = validateParam(params.id, playbookIdSchema);
  if (v.error) return v.error;

  try {
    const playbook = await runPlaybook(v.data);
    if (!playbook) {
      return NextResponse.json({ message: 'Playbook not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Playbook executed successfully.' });
  } catch (error) {
    console.error('Error executing playbook:', error);
    return NextResponse.json(
      { message: 'An error occurred while running the playbook.' },
      { status: 500 }
    );
  }
}
