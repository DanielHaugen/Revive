import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

type JwtPayload = {
  userId: number;
  email: string;
};

/** Extract the authenticated user from the request cookie. Returns null if unauthenticated. */
export async function getAuthUser(): Promise<JwtPayload | null> {
  const token = cookies().get('token')?.value;
  if (!token) return null;

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    return {
      userId: payload.userId as number,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}
