import prisma from '@/lib/prisma';
import { Target } from '@prisma/client';
import { startInstances, stopInstances } from '@/lib/services/instances';

/** Input shape for a target when creating/updating a playbook. */
type TargetInput = {
  instanceId: string;
  instanceName?: string | null;
  availabilityZone?: string | null;
  snapshotId?: string | null;
  snapshotName?: string | null;
};

type StepInput = {
  type: string;
  targets: (TargetInput | string)[];
};

type PlaybookInput = {
  name: string;
  description: string;
  steps: StepInput[];
};

/** List all playbooks with steps and targets. */
export async function listPlaybooks() {
  return prisma.playbook.findMany({
    include: {
      steps: { include: { targets: true } },
    },
  });
}

/** Get a single playbook by ID with steps and targets. Returns null if not found. */
export async function getPlaybook(id: number) {
  return prisma.playbook.findUnique({
    where: { id },
    include: {
      steps: { include: { targets: true } },
    },
  });
}

/** Create a new playbook with steps and targets. */
export async function createPlaybook(data: PlaybookInput) {
  return prisma.playbook.create({
    data: {
      name: data.name,
      description: data.description,
      steps: {
        create: data.steps.map((step) => ({
          type: step.type,
          targets: {
            create: step.targets.map((target) => {
              if (typeof target === 'string') {
                return { instanceId: target };
              }
              return {
                instanceId: target.instanceId,
                instanceName: target.instanceName || null,
                availabilityZone: target.availabilityZone || null,
                snapshotId: target.snapshotId || null,
                snapshotName: target.snapshotName || null,
              };
            }),
          },
        })),
      },
    },
  });
}

/** Update a playbook. Deletes existing steps and recreates them. */
export async function updatePlaybook(
  id: number,
  data: PlaybookInput
) {
  await prisma.step.deleteMany({ where: { playbookId: id } });

  return prisma.playbook.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      steps: {
        create: data.steps.map((step) => ({
          type: step.type,
          targets: {
            create: step.targets.map((target) => {
              if (typeof target === 'string') {
                return { instanceId: target };
              }
              return {
                instanceId: target.instanceId,
                instanceName: target.instanceName || null,
                availabilityZone: target.availabilityZone || null,
                snapshotId: target.snapshotId || null,
                snapshotName: target.snapshotName || null,
              };
            }),
          },
        })),
      },
    },
    include: {
      steps: { include: { targets: true } },
    },
  });
}

/** Delete a playbook by ID. */
export async function deletePlaybook(id: number) {
  return prisma.playbook.delete({ where: { id } });
}

/** Toggle the starred status of a playbook. */
export async function togglePlaybookStar(id: number) {
  const playbook = await prisma.playbook.findUnique({ where: { id } });
  if (!playbook) return null;

  return prisma.playbook.update({
    where: { id },
    data: { starred: !playbook.starred },
  });
}

/** Execute a playbook's steps in order. */
export async function runPlaybook(id: number) {
  const playbook = await getPlaybook(id);
  if (!playbook) return null;

  for (const step of playbook.steps) {
    const ids = step.targets.map((t: Target) => t.instanceId);
    switch (step.type) {
      case 'start-instances':
        await startInstances(ids);
        break;
      case 'stop-instances':
        await stopInstances(ids);
        break;
      case 'restore-instances':
        // TODO: Add restore logic
        break;
      default:
        console.warn(`Unhandled step type: ${step.type}`);
    }
  }

  return playbook;
}
