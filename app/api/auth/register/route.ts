import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma'; // Adjust path if necessary
import { Prisma } from '@prisma/client';

export async function POST(req: Request) {
  const { email, password, firstName, lastName } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { message: 'Email and password are required.' },
      { status: 400 }
    );
  }

  try {
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
    });

    return NextResponse.json(
      { message: 'User created successfully.' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // Handle unique constraint violation (e.g., duplicate email)
        return NextResponse.json(
          { message: 'Email already exists.' },
          { status: 409 }
        );
      }
    }
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
