import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const playbooks = await prisma.playbook.findMany({
      include: {
        steps: {
          include: {
            targets: true, // Include targets for each step
          },
        },
      },
    });
    return new Response(JSON.stringify(playbooks), {
      status: 200,
    });
  } catch (error) {
    return new Response('Error fetching playbooks', {
      status: 500,
    });
  }
}
