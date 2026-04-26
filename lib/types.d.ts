import { Playbook, Step, Target, RestoreJob } from '@prisma/client';

// Extend Step to include associated Targets
export type StepWithTargets = Step & {
  targets: Target[];
};

// Extend Playbook to include associated Steps
export type PlaybookWithDetails = Playbook & {
  steps: StepWithTargets[];
};

// Extend RestoreJob with typed steps array
export type RestoreJobWithSteps = Omit<RestoreJob, 'steps'> & {
  steps: string[];
};
