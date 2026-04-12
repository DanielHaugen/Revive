import { NextResponse } from 'next/server';
import { createPlaybook } from '@/lib/services/playbooks';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, steps } = body;

    if (!name || !description || !steps || !Array.isArray(steps)) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }

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
