import { NextResponse } from 'next/server';
import { validateBody } from '@/lib/validation/helpers';
import { loginSchema } from '@/lib/validation/schemas';
import { loginUser } from '@/lib/services/auth';

export async function POST(req: Request) {
  const result = await validateBody(req, loginSchema);
  if (result.error) return result.error;

  try {
    const login = await loginUser(result.data.email, result.data.password);
    if (!login.ok) {
      return NextResponse.json({ message: login.message }, { status: login.status });
    }

    const response = NextResponse.json({ message: 'Login successful' });
    response.cookies.set('token', login.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 3600,
    });
    return response;
  } catch (error) {
    console.error('[login] Unexpected error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
