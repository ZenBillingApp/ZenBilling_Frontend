import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'


// Routes publiques qui ne nécessitent pas d'authentification
const PUBLIC_ROUTES = ['/login', '/register']

/**
 * Fonction utilitaire pour les redirections
 */
function redirectTo(request: NextRequest, path: string): NextResponse {
  return NextResponse.redirect(new URL(path, request.url));
}

/**
 * Middleware principal pour la gestion de l'authentification
 */
export default async function middleware(request: NextRequest) {
  const hasRefreshToken = request.cookies.has('refresh_token');
  const isPublicRoute = PUBLIC_ROUTES.some(route => request.nextUrl.pathname.startsWith(route));

  // Si l'utilisateur est sur une route publique et a un token, rediriger vers /invoices
  if (isPublicRoute && hasRefreshToken) {
    return redirectTo(request, '/dashboard');
  }

  // Si l'utilisateur n'est pas sur une route publique et n'a pas de token, rediriger vers login
  if (!isPublicRoute && !hasRefreshToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return redirectTo(request, loginUrl.toString());
  }

  // Dans tous les autres cas, continuer normalement
  return NextResponse.next();
}

/**
 * Configuration des routes concernées par le middleware
 */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/dashboard/:path*',
    '/invoices/:path*',
    '/products/:path*',
    '/customers/:path*',
    '/quotes/:path*',
    '/login',
    '/register',
    '/onboarding/:path*'
  ]
}