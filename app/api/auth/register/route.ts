import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { validateBody } from '@/lib/validation/helpers';
import { registerSchema } from '@/lib/validation/schemas';
import { registerUser } from '@/lib/services/auth';

export async function POST(req: Request) {
  const result = await validateBody(req, registerSchema);
  if (result.error) return result.error;

  try {
    await registerUser(result.data);
    return NextResponse.json({ message: 'User created successfully.' }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return NextResponse.json({ message: 'Email already exists.' }, { status: 409 });
    }
    console.error('[register] Error:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
