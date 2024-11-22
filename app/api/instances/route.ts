import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch EC2 instances from the database
    const instances = await prisma.instance.findMany();

    // Return the instances as a JSON response
    return new Response(JSON.stringify(instances), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching instances:', error);

    // Return an error response
    return new Response(JSON.stringify({ error: 'Error fetching instances' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } finally {
    // Close the Prisma client connection to avoid connection leaks
    await prisma.$disconnect();
  }
}
