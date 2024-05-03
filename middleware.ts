import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCookie } from 'cookies-next';

export function middleware(request: NextRequest) {
  const token = getCookie("token", { req: request });  // Fetch the cookie from the request

  // Check if the user is already logged in and trying to access the login page
  if (token && request.nextUrl.pathname.includes('/auth')) {
    // Redirect to the dashboard or another appropriate page
    const url = new URL('/dashboard', request.url);
    return NextResponse.redirect(url.href);
  }

  // Handle not logged-in users trying to access protected routes
  if (!token && !request.nextUrl.pathname.includes('/auth')) {
    // Use an absolute URL for redirection to login
    const url = new URL('/auth/login', request.url);
    return NextResponse.redirect(url.href);
  }

  return NextResponse.next();  // Continue with the request processing
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
};
