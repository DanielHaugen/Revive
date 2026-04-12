const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...\n');

  // Clean existing data (order matters for FK constraints)
  await prisma.target.deleteMany();
  await prisma.step.deleteMany();
  await prisma.playbook.deleteMany();
  await prisma.user.deleteMany();
  console.log('Cleared existing data.');

  // --- Users ---
  const password = await bcrypt.hash('Password1!', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@pcdc.org',
      password,
      firstName: 'Admin',
      lastName: 'User',
    },
  });
  const demo = await prisma.user.create({
    data: {
      email: 'demo@pcdc.org',
      password,
      firstName: 'Demo',
      lastName: 'Operator',
    },
  });
  console.log(`Users created: ${admin.email}, ${demo.email}`);

  // --- Playbooks ---

  // 1. Start All (starred)
  await prisma.playbook.create({
    data: {
      name: 'Start All EC2 Instances',
      description:
        'Starts every EC2 instance accessible to the current IAM user. Useful for morning spin-up of the full environment.',
      starred: true,
      steps: {
        create: [
          {
            type: 'start-instances',
            targets: {
              create: [
                {
                  instanceId: '*',
                  instanceName: 'All Instances',
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log('Created: Start All EC2 Instances');

  // 2. Stop All (starred)
  await prisma.playbook.create({
    data: {
      name: 'Stop All EC2 Instances',
      description:
        'Stops every EC2 instance accessible to the current IAM user. Use at end-of-day to minimize costs.',
      starred: true,
      steps: {
        create: [
          {
            type: 'stop-instances',
            targets: {
              create: [
                {
                  instanceId: '*',
                  instanceName: 'All Instances',
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log('Created: Stop All EC2 Instances');

  // 3. Restore Blue-00 stack from snapshots
  await prisma.playbook.create({
    data: {
      name: 'Restore Blue-00 Stack',
      description:
        'Restores the five core Blue-00 instances from their most recent snapshots.',
      starred: true,
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
  console.log('Created: Restore Blue-00 Stack');

  // 4. Start Web Tier only
  await prisma.playbook.create({
    data: {
      name: 'Start Web Tier',
      description:
        'Starts only the front-end web servers. Useful when database instances are already running.',
      steps: {
        create: [
          {
            type: 'start-instances',
            targets: {
              create: [
                {
                  instanceId: 'i-0454f86c03b5d679e',
                  instanceName: 'Blue-00-API',
                  availabilityZone: 'us-east-1a',
                },
                {
                  instanceId: 'i-082b44bc4767dd1c7',
                  instanceName: 'Blue-00-Chat-Bot',
                  availabilityZone: 'us-east-1a',
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log('Created: Start Web Tier');

  // 5. Start Database Tier only
  await prisma.playbook.create({
    data: {
      name: 'Start Database Tier',
      description:
        'Starts the database and file-server instances. Run this before bringing up the web tier.',
      steps: {
        create: [
          {
            type: 'start-instances',
            targets: {
              create: [
                {
                  instanceId: 'i-00b60e56e3c0afd11',
                  instanceName: 'Blue-00-Billing-DB',
                  availabilityZone: 'us-east-1a',
                },
                {
                  instanceId: 'i-06c74ce400c6343a0',
                  instanceName: 'Blue-00-File-Server',
                  availabilityZone: 'us-east-1a',
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log('Created: Start Database Tier');

  // 6. Full Environment Restart (multi-step: stop all → start DB → start web)
  await prisma.playbook.create({
    data: {
      name: 'Full Environment Restart',
      description:
        'Performs a graceful restart of the entire environment: stops all instances, then starts the database tier followed by the web tier.',
      steps: {
        create: [
          {
            type: 'stop-instances',
            targets: {
              create: [
                {
                  instanceId: '*',
                  instanceName: 'All Instances',
                },
              ],
            },
          },
          {
            type: 'start-instances',
            targets: {
              create: [
                {
                  instanceId: 'i-00b60e56e3c0afd11',
                  instanceName: 'Blue-00-Billing-DB',
                  availabilityZone: 'us-east-1a',
                },
                {
                  instanceId: 'i-06c74ce400c6343a0',
                  instanceName: 'Blue-00-File-Server',
                  availabilityZone: 'us-east-1a',
                },
                {
                  instanceId: 'i-0796a7256b8b61810',
                  instanceName: 'Blue-00-DC',
                  availabilityZone: 'us-east-1a',
                },
              ],
            },
          },
          {
            type: 'start-instances',
            targets: {
              create: [
                {
                  instanceId: 'i-0454f86c03b5d679e',
                  instanceName: 'Blue-00-API',
                  availabilityZone: 'us-east-1a',
                },
                {
                  instanceId: 'i-082b44bc4767dd1c7',
                  instanceName: 'Blue-00-Chat-Bot',
                  availabilityZone: 'us-east-1a',
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log('Created: Full Environment Restart');

  // 7. Disaster Recovery — restore + start
  await prisma.playbook.create({
    data: {
      name: 'Disaster Recovery',
      description:
        'Restores the Billing DB and File Server from critical snapshots, then starts the full stack. Use when data corruption is detected.',
      steps: {
        create: [
          {
            type: 'stop-instances',
            targets: {
              create: [
                {
                  instanceId: 'i-00b60e56e3c0afd11',
                  instanceName: 'Blue-00-Billing-DB',
                  availabilityZone: 'us-east-1a',
                },
                {
                  instanceId: 'i-06c74ce400c6343a0',
                  instanceName: 'Blue-00-File-Server',
                  availabilityZone: 'us-east-1a',
                },
              ],
            },
          },
          {
            type: 'restore-instances',
            targets: {
              create: [
                {
                  instanceId: 'i-00b60e56e3c0afd11',
                  instanceName: 'Blue-00-Billing-DB',
                  availabilityZone: 'us-east-1a',
                  snapshotId: 'snap-01a8e2b2f72203080',
                  snapshotName: 'Monthly-Backup-November',
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
          {
            type: 'start-instances',
            targets: {
              create: [
                {
                  instanceId: '*',
                  instanceName: 'All Instances',
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log('Created: Disaster Recovery');

  // 8. Stop Single Instance (DC)
  await prisma.playbook.create({
    data: {
      name: 'Stop Domain Controller',
      description:
        'Stops the Blue-00 Domain Controller for maintenance or patching.',
      steps: {
        create: [
          {
            type: 'stop-instances',
            targets: {
              create: [
                {
                  instanceId: 'i-0796a7256b8b61810',
                  instanceName: 'Blue-00-DC',
                  availabilityZone: 'us-east-1a',
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log('Created: Stop Domain Controller');

  console.log('\nSeeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
