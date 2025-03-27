import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// import { IUser } from '@/types/User.interface'

// // Constantes
// const ONBOARDING_STEPS = {
//   CHOOSING_COMPANY: "/onboarding/company",
//   FINISH: "/onboarding/finish",
// } as const

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

function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some(route => path.startsWith(route))
}

/**
 * Fonction utilitaire pour les redirections
 */
function redirectTo(request: NextRequest, path: string): NextResponse {
  return NextResponse.redirect(new URL(path, request.url));
}

/**
 * Middleware principal
 */
export default async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Vérification des tokens d'authentification
  const hasAuthToken = request.cookies.has('access_token');
  const hasRefreshToken = request.cookies.has('refresh_token');
  const isAuthenticated = hasAuthToken || hasRefreshToken;

  // Gestion des routes publiques
  if (isPublicRoute(path)) {
    if (isAuthenticated) {
      return redirectTo(request, '/invoices');
    }
    return NextResponse.next();
  }

  // Protection des routes privées
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', path);
    return redirectTo(request, loginUrl.toString());
  }

  return NextResponse.next();
}

/**
 * Configuration des routes concernées par le middleware
 */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/invoices/:path*',
    '/products/:path*',
    '/customers/:path*',
    '/quotes/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/onboarding/:path*'
  ]
}