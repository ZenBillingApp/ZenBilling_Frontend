import { NextResponse, NextRequest } from 'next/server'
import { betterFetch } from "@better-fetch/fetch";
import { authClient } from '@/lib/auth-client';

// Routes publiques qui ne nécessitent pas d'authentification
const PUBLIC_ROUTES = ['/login', '/register', '/payment']

type Session = typeof authClient.$Infer.Session;

/**
 * Fonction utilitaire pour les redirections
 */
function redirectTo(request: NextRequest, path: string): NextResponse {
  return NextResponse.redirect(new URL(path, request.url));
}


/**
 * Middleware principal pour la gestion de l'authentification
 */
export default async function proxy(request: NextRequest, context: { headers: Headers }) {

  const { pathname } = request.nextUrl;

  // Si la route est publique → laisser passer
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
		baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_API_URL,
		headers: {
			cookie: request.headers.get("cookie") || "", // Forward the cookies from the request
		},
	});

  // 1. pas connecté
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }


  // 3. pas d’organisation active
  if (!session.session.activeOrganizationId && pathname !== "/select-organization") {
    return NextResponse.redirect(new URL('/select-organization', request.url));
  }

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
    '/select-organization/:path*',
    '/payment/:path*',
    '/login',
    '/register'
  ]
}