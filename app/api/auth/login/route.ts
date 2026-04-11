import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma'; // Assume you are using Prisma for DB interaction
import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const JWT_SECRET: string = process.env.JWT_SECRET;

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { message: 'Email and password are required.' },
      { status: 400 }
    );
  }

  try {
    console.info(`[login] Attempting login for: ${email}`);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.warn(`[login] User not found: ${email}`);
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    // Compare the provided password with the hashed password stored in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.warn(`[login] Invalid password for: ${email}`);
      return NextResponse.json(
        { message: 'Invalid password.' },
        { status: 401 }
      );
    }

    // Create a JWT token for the authenticated user
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '1h', // Token expiration time (optional)
    });

    console.info(`[login] Successful login for: ${email}`);
    // Set token as a secure, httpOnly cookie
    const response = NextResponse.json(
      { message: 'Login successful' },
      { status: 200 }
    );
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Secure in production
      sameSite: 'strict',
      path: '/',
      maxAge: 3600, // 1 hour
    });

    // Respond with the token or a success message
    return response;
  } catch (error) {
    console.error('[login] Unexpected error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
