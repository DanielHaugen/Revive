# AWS Configuration for Restoration

The restore workflow stops an instance, replaces its root EBS volume with a
new one created from the chosen snapshot, then restarts the instance. The AWS
IAM identity used by the app (identified by `AWS_ACCESS_KEY_ID` /
`AWS_SECRET_ACCESS_KEY`) **must have the following EC2 permissions**:

| Permission | Why it's needed |
|---|---|
| `ec2:DescribeInstances` | Determine the instance's Availability Zone and current root volume |
| `ec2:DescribeVolumes` | Check the attachment state of the original volume |
| `ec2:StopInstances` | Stop the instance before swapping volumes |
| `ec2:StartInstances` | Restart the instance after the new volume is attached |
| `ec2:CreateVolume` | Create a new EBS volume from the snapshot |
| `ec2:AttachVolume` | Attach the new volume to the instance (`/dev/xvda`) |
| `ec2:DetachVolume` | Detach the original root volume |
| `ec2:DescribeSnapshots` | List and resolve snapshot IDs |
| `ec2:CreateSnapshot` | (Optional) Take a pre-restore backup of the current volume |
| `ec2:DeleteSnapshot` | (Optional) Delete snapshots from the UI |
| `ec2:CreateTags` / `ec2:DeleteTags` | Tag instances, volumes, and snapshots from the UI |
| `sts:GetCallerIdentity` | Identify the IAM principal for permission pre-checks |
| `iam:SimulatePrincipalPolicy` | Pre-flight IAM permission checks on the Restoration page |

## Minimal IAM Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReviveEC2Access",
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances",
        "ec2:DescribeVolumes",
        "ec2:DescribeSnapshots",
        "ec2:StopInstances",
        "ec2:StartInstances",
        "ec2:RebootInstances",
        "ec2:CreateVolume",
        "ec2:AttachVolume",
        "ec2:DetachVolume",
        "ec2:CreateSnapshot",
        "ec2:DeleteSnapshot",
        "ec2:CreateTags",
        "ec2:DeleteTags"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ReviveIAMPreflightCheck",
      "Effect": "Allow",
      "Action": [
        "sts:GetCallerIdentity",
        "iam:SimulatePrincipalPolicy"
      ],
      "Resource": "*"
    }
  ]
}
```

> **Tip — scope by resource tag**: For tighter security, replace `"Resource": "*"` with ARN
> conditions that match only the instances and volumes you manage, e.g.:
> ```json
> "Resource": "arn:aws:ec2:us-east-1:123456789012:instance/*",
> "Condition": { "StringEquals": { "aws:ResourceTag/ManagedBy": "revive" } }
> ```

## Snapshot Requirements

For a restore to succeed the snapshot **must**:

1. Be owned by the same AWS account (`OwnerIds: ['self']` is used by the snapshot list API).
2. Be in **Completed** state — in-progress snapshots cannot be used to create a volume.
3. Reside in the **same AWS region** as the target instance (cross-region restores are not currently supported).
4. Have been taken from an EBS volume that is compatible with the target instance type (e.g., `gp2`/`gp3` for most modern instance types; `io1`/`io2` for provisioned IOPS workloads).

## Volume Device Name

The restore route attaches the new volume at `/dev/xvda`, which is the
standard root device for most Amazon Linux 2, Ubuntu, and Debian AMIs. If your
instances use a different root device (e.g., `/dev/sda1` for some older AMIs,
or `/dev/nvme0n1` exposed by the OS), the attach call will succeed but the
instance may not boot correctly.

To verify the root device name for an instance, check the **Block Device
Mappings** section on the instance detail page — the root volume device is
listed there.
