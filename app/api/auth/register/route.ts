import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(req: Request) {
  let email: string | undefined;

  try {
    const body = await req.json();
    email = body.email;
    const { password, firstName, lastName } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    console.info(`[register] Attempting to register user: ${email}`);

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
    });

    console.info(`[register] Successfully registered user: ${email}`);
    return NextResponse.json(
      { message: 'User created successfully.' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        console.warn(`[register] Duplicate email attempt: ${email}`);
        return NextResponse.json(
          { message: 'Email already exists.' },
          { status: 409 }
        );
      }
      console.error(`[register] Prisma known error (${error.code}):`, error.message);
    } else if (error instanceof Prisma.PrismaClientInitializationError) {
      console.error('[register] Prisma failed to connect to database:', error.message);
    } else {
      console.error('[register] Unexpected error:', error);
    }
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
