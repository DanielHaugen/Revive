import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const JWT_SECRET: string = process.env.JWT_SECRET;

export type LoginResult =
  | { ok: true; token: string }
  | { ok: false; status: number; message: string };

export async function loginUser(
  email: string,
  password: string
): Promise<LoginResult> {
  console.info(`[login] Attempting login for: ${email}`);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.warn(`[login] User not found: ${email}`);
    return { ok: false, status: 404, message: 'User not found.' };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    console.warn(`[login] Invalid password for: ${email}`);
    return { ok: false, status: 401, message: 'Invalid password.' };
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  console.info(`[login] Successful login for: ${email}`);
  return { ok: true, token };
}

export type RegisterResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

export async function registerUser(data: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<RegisterResult> {
  console.info(`[register] Attempting to register user: ${data.email}`);

  const hashedPassword = await bcrypt.hash(data.password, 10);

  await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
    },
  });

  console.info(`[register] Successfully registered user: ${data.email}`);
  return { ok: true };
}
