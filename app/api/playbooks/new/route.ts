import { Target } from '@prisma/client';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, description, steps } = body;

    if (!name || !description || !steps || !Array.isArray(steps)) {
      return new Response(JSON.stringify({ message: 'Invalid input data' }), {
        status: 400,
      });
    }

    // Create the playbook with related steps and targets
    const newPlaybook = await prisma.playbook.create({
      data: {
        name,
        description,
        steps: {
          create: steps.map((step: any) => ({
            type: step.type,
            targets: {
              create: step.targets.map((target: Target) => {
                // TODO: Target is currently just the `instanceId`
                const {
                  instanceId,
                  instanceName,
                  availabilityZone,
                  snapshotId,
                  snapshotName,
                } = target;
                return {
                  instanceId: target,
                  instanceName: instanceName || null,
                  availabilityZone: availabilityZone || null,
                  snapshotId: snapshotId || null,
                  snapshotName: snapshotName || null,
                };
              }),
            },
          })),
        },
      },
    });

    return new Response(JSON.stringify(newPlaybook), { status: 201 });
  } catch (error) {
    console.error('Error creating playbook:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}
