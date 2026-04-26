import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateParam } from '@/lib/validation/helpers';
import { playbookIdSchema } from '@/lib/validation/schemas';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const v = validateParam(params.id, playbookIdSchema);
  if (v.error) return v.error;
  const id = v.data;

  try {
    const log = await prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });

    if (!log) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(log);
  } catch (error) {
    console.error('Error fetching audit log:', error);
    return NextResponse.json({ error: 'Failed to fetch audit log' }, { status: 500 });
  }
}
