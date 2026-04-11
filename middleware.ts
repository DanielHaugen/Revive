import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (publicPath) =>
      pathname === publicPath || pathname.startsWith(publicPath + '/')
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths, static assets, and Next.js internals
  if (
    isPublicPath(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|ico|css|js)$/)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  if (!token) {
    // Redirect to login for page requests, return 401 for API requests
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const encodedSecret = new TextEncoder().encode(secret);
    await jwtVerify(token, encodedSecret);

    return NextResponse.next();
  } catch {
    // Token is invalid or expired — clear it and redirect
    if (pathname.startsWith('/api/')) {
      const response = NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
      response.cookies.delete('token');
      return response;
    }
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
