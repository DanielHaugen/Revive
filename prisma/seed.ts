const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Example of seeding EC2 instances with sample data
  const instances = await prisma.instance.createMany({
    data: [
      {
        name: 'Instance 1',
        type: 't2.micro',
        status: 'running',
      },
      {
        name: 'Instance 2',
        type: 't2.small',
        status: 'stopped',
      },
      {
        name: 'Instance 3',
        type: 't2.medium',
        status: 'terminated',
      },
    ],
  });
  console.log(`${instances.count} instances created!`);

  const startAllPlaybook = await prisma.playbook.create({
    data: {
      name: 'Start All EC2 Instances',
      description:
        'Starts all EC2 instances that are accessible to the current IAM user.',
      steps: {
        create: [
          {
            type: 'start-instances',
            targets: {
              create: [
                {
                  instanceId: '*',
                  instanceName: 'All Instances',
                  availabilityZone: 'us-east-1c',
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log('Start All EC2 Instances Playbook Created:', startAllPlaybook);

  // Seed: Stop All EC2 Instances
  const stopAllPlaybook = await prisma.playbook.create({
    data: {
      name: 'Stop All EC2 Instances',
      description:
        'Stops all EC2 instances that are accessible to the current IAM user.',
      steps: {
        create: [
          {
            type: 'stop-instances',
            targets: {
              create: [
                {
                  instanceId: '*',
                  instanceName: 'All Instances',
                  availabilityZone: 'us-east-1c',
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log('Stop All EC2 Instances Playbook Created:', stopAllPlaybook);

  // Seed: Restore 5 Example EC2 Instances
  const restorePlaybook = await prisma.playbook.create({
    data: {
      name: 'Restore EC2 Instances from Snapshot',
      description:
        'Restores specific EC2 instances from their respective snapshots.',
      steps: {
        create: [
          {
            type: 'restore-instances',
            targets: {
              create: [
                {
                  instanceId: 'i-0454f86c03b5d679e',
                  instanceName: 'Blue-00-API',
                  availabilityZone: 'us-east-1a',
                  snapshotId: 'snap-0d848f0f1a9ad7e55',
                  snapshotName: 'Backup-2024-12-01',
                },
                {
                  instanceId: 'i-00b60e56e3c0afd11',
                  instanceName: 'Blue-00-Billing-DB',
                  availabilityZone: 'us-east-1a',
                  snapshotId: 'snap-01a8e2b2f72203080',
                  snapshotName: 'Monthly-Backup-November',
                },
                {
                  instanceId: 'i-082b44bc4767dd1c7',
                  instanceName: 'Blue-00-Chat-Bot',
                  availabilityZone: 'us-east-1a',
                  snapshotId: 'snap-087d48716b3baea0b',
                  snapshotName: 'Weekly-Backup-December',
                },
                {
                  instanceId: 'i-0796a7256b8b61810',
                  instanceName: 'Blue-00-DC',
                  availabilityZone: 'us-east-1a',
                  snapshotId: 'snap-06c8b2adcfa370b3c',
                  snapshotName: 'Weekly-Backup-December',
                },
                {
                  instanceId: 'i-06c74ce400c6343a0',
                  instanceName: 'Blue-00-File-Server',
                  availabilityZone: 'us-east-1a',
                  snapshotId: 'snap-09dac39f467d23256',
                  snapshotName: 'Critical-Backup-2024',
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log('Restore EC2 Instances Playbook Created:', restorePlaybook);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
