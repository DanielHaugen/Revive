import { NextResponse } from 'next/server';
import { Target } from '@prisma/client';
import { startInstances, stopInstances } from '@/lib/services/instances';
import { getPlaybook } from '@/lib/services/playbooks';

// POST /api/playbooks/[id]/run
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { message: 'Invalid Playbook ID' },
      { status: 400 }
    );
  }

  try {
    const playbook = await getPlaybook(parseInt(id));

    if (!playbook) {
      return NextResponse.json(
        { message: 'Playbook not found' },
        { status: 404 }
      );
    }

    // Iterate through the steps and execute actions
    for (const step of playbook.steps) {
      switch (step.type) {
        case 'start-instances':
          await handleStartInstances(step.targets);
          break;
        case 'stop-instances':
          await handleStopInstances(step.targets);
          break;
        case 'restore-instances':
          await handleRestoreInstances(step.targets);
          break;
        default:
          console.warn(`Unhandled step type: ${step.type}`);
      }
    }

    return NextResponse.json({ message: 'Playbook executed successfully.' });
  } catch (error: unknown) {
    console.error('Error executing playbook:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';

    return NextResponse.json(
      {
        message: 'An error occurred while running the playbook.',
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

// Example: Handle starting instances
const handleStartInstances = async (targets: Target[]) => {
  const ids = targets.map((t) => t.instanceId);
  try {
    await startInstances(ids);
  } catch (error) {
    console.error('Error starting instance', error);
  }
};

// Example: Handle stopping instances
const handleStopInstances = async (targets: Target[]) => {
  const ids = targets.map((t) => t.instanceId);
  try {
    await stopInstances(ids);
  } catch (error) {
    console.error('Error stopping instance', error);
  }
};

// Example: Handle restoring instances
const handleRestoreInstances = async (targets: Target[]) => {
  for (const target of targets) {
    // TODO: Add AWS SDK logic to restore instance from snapshot
  }
};
