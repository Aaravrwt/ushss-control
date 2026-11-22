import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth/session';

// Protected Dean routes
const protectedRoutes = [
  '/',
  '/students',
  '/individual-attendance',
  '/subject-attendance',
  '/class-attendance',
  '/overall-attendance',
  '/database-explorer',
  '/activity-history',
  '/settings',
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Exclude static assets, api/auth/login, etc.
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api/auth/login') ||
    path.includes('.') ||
    path === '/login'
  ) {
    return NextResponse.next();
  }

  const isProtected = protectedRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  if (isProtected) {
    const cookie = request.cookies.get('ushss_dean_session')?.value;
    const session = await decrypt(cookie);

    if (!session) {
      const loginUrl = new URL('/login', request.nextUrl);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/auth/login|_next/static|_next/image|favicon.ico).*)'],
};
