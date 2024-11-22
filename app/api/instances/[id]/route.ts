import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Assuming you have a Prisma client file in /lib/prisma.ts
import { NextApiRequest } from 'next';

// API route to fetch a single EC2 instance by ID from the database
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const instance = await prisma.instance.findUnique({
      where: {
        id: id,
      },
    });

    if (!instance) {
      return new NextResponse('Instance not found', { status: 404 });
    }

    return NextResponse.json(instance);
  } catch (error) {
    console.error('Error fetching instance:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
