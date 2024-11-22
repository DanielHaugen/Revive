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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
