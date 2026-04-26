'use client';

import { FaCircle, FaCircleCheck, FaCircleXmark, FaSpinner } from 'react-icons/fa6';

export const RESTORE_STEPS = [
  'Stop instance',
  'Get availability zone',
  'Create volume from snapshot',
  'Detach original volume',
  'Await new volume ready',
  'Attach new volume',
  'Start instance',
];

export type StepStatus = 'pending' | 'active' | 'done' | 'error';

export const INITIAL_STATUSES: StepStatus[] = RESTORE_STEPS.map(() => 'pending');

/** Map an SSE progress message to a step index + status transition. */
export function parseMessageToStep(
  msg: string,
): { step: number; status: 'active' | 'done' | 'error' } | null {
  const m = msg.toLowerCase();
  if (m.startsWith('error:')) return { step: -1, status: 'error' };
  if (m.startsWith('stopping instance')) return { step: 0, status: 'active' };
  if (m.includes('instance') && m.includes('stopped.')) return { step: 0, status: 'done' };
  if (m.includes('availability zone')) return { step: 1, status: 'done' };
  if (m.startsWith('creating new volume')) return { step: 2, status: 'active' };
  if (m.includes('volume') && m.includes('created.')) return { step: 2, status: 'done' };
  if (m.startsWith('detaching original')) return { step: 3, status: 'active' };
  if (
    m.includes('no original volume') ||
    m.includes('already detached') ||
    (m.includes('original volume') && m.includes('detached.'))
  ) return { step: 3, status: 'done' };
  if (m.startsWith('waiting for new volume')) return { step: 4, status: 'active' };
  if (m.includes('is available')) return { step: 4, status: 'done' };
  if (m.startsWith('attaching new volume')) return { step: 5, status: 'active' };
  if (m.includes('attached to instance')) return { step: 5, status: 'done' };
  if (m.startsWith('starting instance')) return { step: 6, status: 'active' };
  if (
    (m.includes('instance') && m.includes('started.')) ||
    m === 'restoration complete.'
  ) return { step: 6, status: 'done' };
  return null;
}

/**
 * Map an EC2 action name (from an authorization error message) to the step index it failed on.
 * Returns -1 if the action cannot be mapped to a step.
 */
const EC2_ACTION_TO_STEP: Record<string, number> = {
  'ec2:stopinstances':   0,
  'ec2:describeinstances': 1,
  'ec2:createvolume':    2,
  'ec2:detachvolume':    3,
  'ec2:attachvolume':    5,
  'ec2:startinstances':  6,
};

function failedStepFromError(error: string): number {
  const lower = error.toLowerCase();
  // Prefer exact "perform: ec2:Action" pattern from AWS error messages
  const match = lower.match(/perform:\s*(ec2:[a-z]+)/);
  if (match) {
    const idx = EC2_ACTION_TO_STEP[match[1]];
    if (idx !== undefined) return idx;
  }
  // Fallback: scan for any known action substring
  for (const [action, idx] of Object.entries(EC2_ACTION_TO_STEP)) {
    if (lower.includes(action)) return idx;
  }
  return -1;
}

/**
 * Derive static step statuses for a completed or failed historical restore.
 * For failed restores, pass the error string so the exact step can be identified
 * from the EC2 action name embedded in the AWS authorization error message.
 */
export function statusesFromOutcome(
  outcome: 'completed' | 'failed',
  errorMessage?: string,
): StepStatus[] {
  if (outcome === 'completed') return RESTORE_STEPS.map(() => 'done' as StepStatus);

  const failedStep = errorMessage ? failedStepFromError(errorMessage) : -1;

  return RESTORE_STEPS.map((_, i) => {
    if (failedStep >= 0) {
      if (i < failedStep)  return 'done';
      if (i === failedStep) return 'error';
      return 'pending';
    }
    // No step identified — fall back to marking only the last step as error
    if (i < RESTORE_STEPS.length - 1) return 'done';
    return 'error';
  }) as StepStatus[];
}

function StepIcon({ status }: { status: StepStatus }) {
  if (status === 'done') return <FaCircleCheck className="text-green-400" />;
  if (status === 'active') return <FaSpinner className="text-blue-400 animate-spin" />;
  if (status === 'error') return <FaCircleXmark className="text-red-400" />;
  return <FaCircle className="text-gray-600" />;
}

export function RestoreTimeline({ statuses }: { statuses: StepStatus[] }) {
  return (
    <ol className="space-y-3">
      {RESTORE_STEPS.map((label, i) => {
        const status = statuses[i];
        return (
          <li key={i} className="flex items-center gap-3 text-sm">
            <span className="text-base flex-shrink-0">
              <StepIcon status={status} />
            </span>
            <span
              className={
                status === 'active' ? 'text-white font-medium' :
                status === 'done'   ? 'text-gray-300' :
                status === 'error'  ? 'text-red-400' :
                'text-gray-600'
              }
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
