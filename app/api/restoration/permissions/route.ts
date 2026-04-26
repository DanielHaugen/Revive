import { NextResponse } from 'next/server';
import { GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import { SimulatePrincipalPolicyCommand } from '@aws-sdk/client-iam';
import { iamClient, stsClient } from '@/lib/services/aws';

/** Actions required to perform a full restore. */
export const RESTORE_ACTIONS = [
  'ec2:StopInstances',
  'ec2:DescribeInstances',
  'ec2:DescribeVolumes',
  'ec2:CreateVolume',
  'ec2:DetachVolume',
  'ec2:AttachVolume',
  'ec2:StartInstances',
];

export type PermissionResult = {
  action: string;
  allowed: boolean;
  decision: string;
};

export type PermissionsCheckResponse = {
  callerArn: string;
  checks: PermissionResult[];
  allAllowed: boolean;
  /** Set when the check itself could not be performed (missing iam:SimulatePrincipalPolicy). */
  checkUnavailable?: boolean;
  error?: string;
};

export async function GET(): Promise<NextResponse<PermissionsCheckResponse>> {
  try {
    // 1. Resolve the caller's ARN
    const identity = await stsClient.send(new GetCallerIdentityCommand({}));
    const callerArn = identity.Arn ?? '';

    // 2. Simulate each required action against * resources
    let checks: PermissionResult[] = [];
    try {
      const sim = await iamClient.send(
        new SimulatePrincipalPolicyCommand({
          PolicySourceArn: callerArn,
          ActionNames: RESTORE_ACTIONS,
          ResourceArns: ['*'],
        }),
      );

      checks = (sim.EvaluationResults ?? []).map((r) => ({
        action: r.EvalActionName ?? '',
        allowed: r.EvalDecision === 'allowed',
        decision: r.EvalDecision ?? 'unknown',
      }));

      return NextResponse.json({
        callerArn,
        checks,
        allAllowed: checks.every((c) => c.allowed),
      });
    } catch (simErr: unknown) {
      // iam:SimulatePrincipalPolicy is not granted — degrade gracefully
      const code =
        simErr instanceof Error &&
        'Code' in simErr
          ? (simErr as { Code?: string }).Code
          : undefined;

      if (code === 'AccessDenied' || code === 'AccessDeniedException') {
        return NextResponse.json({
          callerArn,
          checks: [],
          allAllowed: true, // can't confirm either way — don't block the user
          checkUnavailable: true,
        });
      }
      throw simErr;
    }
  } catch (err) {
    console.error('Permissions check failed:', err);
    return NextResponse.json(
      {
        callerArn: '',
        checks: [],
        allAllowed: true,
        checkUnavailable: true,
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
