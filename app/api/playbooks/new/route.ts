import { NextResponse } from 'next/server';
import { createPlaybook } from '@/lib/services/playbooks';
import { validateBody } from '@/lib/validation/helpers';
import { playbookBodySchema } from '@/lib/validation/schemas';

export async function POST(req: Request) {
  try {
    const result = await validateBody(req, playbookBodySchema);
    if (result.error) return result.error;
    const { name, description, steps } = result.data;

    const playbook = await createPlaybook({ name, description, steps });
    return NextResponse.json(playbook, { status: 201 });
  } catch (error) {
    console.error('Error creating playbook:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
