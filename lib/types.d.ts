import { Playbook, Step, Target } from '@prisma/client';

// Extend Step to include associated Targets
export type StepWithTargets = Step & {
  targets: Target[];
};

// Extend Playbook to include associated Steps
export type PlaybookWithDetails = Playbook & {
  steps: StepWithTargets[];
};
