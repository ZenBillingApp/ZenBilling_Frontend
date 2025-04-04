import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// import { IUser } from '@/types/User.interface'

// // Constantes
// const ONBOARDING_STEPS = {
//   CHOOSING_COMPANY: "/onboarding/company",
//   FINISH: "/onboarding/finish",
// } as const

// Routes publiques qui ne nécessitent pas d'authentification
const PUBLIC_ROUTES = ['/login', '/register']



// /**
//  * Gère l'accès utilisateur en fonction de son état d'onboarding
//  */
// function handleUserAccess(request: NextRequest, user: IUser, path: string): NextResponse {
//   // Gestion de l'onboarding
//   if (!user.onboarding_completed) {
//     const onboardingRedirectPath = ONBOARDING_STEPS[user.onboarding_step ?? "CHOOSING_COMPANY"];
    
//     if (!path.startsWith("/onboarding") || path !== onboardingRedirectPath) {
//       return redirectTo(request, onboardingRedirectPath);
//     }
//   } 
//   // Redirection des utilisateurs qui ont complété l'onboarding mais accèdent aux pages d'onboarding
//   else if (path.startsWith("/onboarding")) {
//     return redirectTo(request, "/invoices");
//   }
  
//   return NextResponse.next();
// }

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