import { NextResponse, NextRequest } from 'next/server'
import { getSessionCookie } from "better-auth/cookies";
import { IOnboardingStep } from '@/types/User.interface'
import { getCookie } from '@/lib/serverCookies'

// Routes publiques qui ne nécessitent pas d'authentification
const PUBLIC_ROUTES = ['/login', '/register', '/payment']
const ONBOARDING_ROUTES = ['/onboarding/company', '/onboarding/finish', '/onboarding/stripe']

const ONBOARDING_STEPS: Record<IOnboardingStep, string> = {
  CHOOSING_COMPANY: "/onboarding/company",
  FINISH: "/onboarding/finish",
  STRIPE_SETUP: "/onboarding/stripe",
} as const;

/**
 * Fonction utilitaire pour les redirections
 */
function redirectTo(request: NextRequest, path: string): NextResponse {
  return NextResponse.redirect(new URL(path, request.url));
}

/**
 * Fonction utilitaire pour parser les données utilisateur de manière sécurisée
 */
function parseUserData(cookieValue: string | undefined) {
  try {
    return cookieValue ? JSON.parse(cookieValue) : {};
  } catch (error) {
    console.error('Erreur lors du parsing des données utilisateur:', error);
    return {};
  }
}

/**
 * Middleware principal pour la gestion de l'authentification
 */
export default async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const isPublicRoute = PUBLIC_ROUTES.some(route => request.nextUrl.pathname.startsWith(route));
  const isOnboardingRoute = ONBOARDING_ROUTES.some(route => request.nextUrl.pathname.startsWith(route));
  
  const userCookie = await getCookie('auth-storage');
  const userData = parseUserData(userCookie);
  const userExists = userData.state?.user !== undefined && userData.state?.user !== null;
  const { onboarding_completed, onboarding_step } = userData.state?.user || {};

  // Redirection vers login si non authentifié
  if (!isPublicRoute && !sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    const response = redirectTo(request, loginUrl.toString());
    response.cookies.delete('auth-storage');
    return response;
  }

  // Gestion de l'onboarding (seulement si les données utilisateur sont disponibles)
  if (sessionCookie && userExists) {
    // Redirection vers le dashboard si l'onboarding est complété et l'utilisateur est sur une route publique
    if (isPublicRoute && onboarding_completed) {
      return redirectTo(request, '/dashboard');
    }

    // Redirection vers l'étape appropriée de l'onboarding
    if (!onboarding_completed) {
      const nextStep = onboarding_step && ONBOARDING_STEPS[onboarding_step as IOnboardingStep] 
        ? ONBOARDING_STEPS[onboarding_step as IOnboardingStep] 
        : ONBOARDING_STEPS.CHOOSING_COMPANY;

      if (!isOnboardingRoute || request.nextUrl.pathname !== nextStep) {
        return redirectTo(request, nextStep);
      }
    }

    // Redirection vers le dashboard si l'onboarding est complété
    if (onboarding_completed && isOnboardingRoute) {
      return redirectTo(request, '/dashboard');
    }
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
    '/onboarding/:path*',
    '/payment/:path*',
    '/login',
    '/register'
  ]
}