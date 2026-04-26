import { NextResponse } from 'next/server';
import {
  StopInstancesCommand,
  StartInstancesCommand,
  CreateVolumeCommand,
  DetachVolumeCommand,
  AttachVolumeCommand,
  DescribeInstancesCommand,
} from '@aws-sdk/client-ec2';
import { ec2Client } from '@/lib/services/aws';
import { awsInstanceIdSchema } from '@/lib/validation/schemas';

type DryRunResult = {
  action: string;
  allowed: boolean;
  error?: string;
};

/** Run a DryRun EC2 call and return whether the principal is authorized. */
async function dryRun(action: string, fn: () => Promise<unknown>): Promise<DryRunResult> {
  try {
    await fn();
    return { action, allowed: true };
  } catch (err: unknown) {
    // AWS SDK v3 exposes the error code as `err.name` (e.g. 'DryRunOperation').
    // SDK v2-style `err.Code` is not present in v3.
    const code = err instanceof Error ? err.name : undefined;

    if (code === 'DryRunOperation') {
      // "Request would have succeeded, but DryRun flag is set." — authorized
      return { action, allowed: true };
    }
    if (code === 'UnauthorizedOperation') {
      return { action, allowed: false };
    }
    // Unexpected error (e.g. instance not found) — don't block the user
    return { action, allowed: true, error: String(err) };
  }
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const parsed = awsInstanceIdSchema.safeParse(params.id);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid instance ID' }, { status: 400 });
  }

  const instanceId = parsed.data;

  // Describe the instance first to get the AZ and root volume ID.
  // These are needed for accurate DryRun checks on CreateVolume / DetachVolume / AttachVolume.
  let availabilityZone = `${process.env.AWS_REGION ?? 'us-east-1'}a`;
  let rootVolumeId: string | undefined;

  try {
    const desc = await ec2Client.send(
      new DescribeInstancesCommand({ InstanceIds: [instanceId] }),
    );
    const inst = desc.Reservations?.[0]?.Instances?.[0];
    if (inst?.Placement?.AvailabilityZone) {
      availabilityZone = inst.Placement.AvailabilityZone;
    }
    // Find the root device volume
    const rootDevice = inst?.RootDeviceName;
    rootVolumeId = inst?.BlockDeviceMappings?.find(
      (b) => b.DeviceName === rootDevice,
    )?.Ebs?.VolumeId;
  } catch {
    // If describe fails we fall back to defaults; the DryRun checks will still run
  }

  const checks = await Promise.all([
    dryRun('ec2:StopInstances', () =>
      ec2Client.send(new StopInstancesCommand({ InstanceIds: [instanceId], DryRun: true })),
    ),
    dryRun('ec2:CreateVolume', () =>
      ec2Client.send(
        new CreateVolumeCommand({
          AvailabilityZone: availabilityZone,
          // Use a placeholder size — DryRun checks IAM permission before validating parameters
          Size: 8,
          VolumeType: 'gp3',
          DryRun: true,
        }),
      ),
    ),
    ...(rootVolumeId
      ? [
          dryRun('ec2:DetachVolume', () =>
            ec2Client.send(
              new DetachVolumeCommand({ VolumeId: rootVolumeId, DryRun: true }),
            ),
          ),
          dryRun('ec2:AttachVolume', () =>
            ec2Client.send(
              new AttachVolumeCommand({
                VolumeId: rootVolumeId,
                InstanceId: instanceId,
                Device: '/dev/xvda',
                DryRun: true,
              }),
            ),
          ),
        ]
      : []),
    dryRun('ec2:StartInstances', () =>
      ec2Client.send(new StartInstancesCommand({ InstanceIds: [instanceId], DryRun: true })),
    ),
  ]);

  return NextResponse.json({
    instanceId,
    checks,
    allAllowed: checks.every((c) => c.allowed),
  });
}
