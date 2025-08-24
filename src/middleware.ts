import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

const PUBLIC_ROUTES = ['/login', '/register', '/db/post'];

export async function middleware(request: NextRequest) {
  const session = getSessionCookie(request);

  const isPublicRoute = PUBLIC_ROUTES.includes(request.nextUrl.pathname);

  if (!session && !isPublicRoute) {
    return NextResponse.redirect(
      new URL(`/login?return_url=${request.nextUrl.pathname}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
