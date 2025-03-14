import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { IUser } from '@/types/User.interface'
import { IApiSuccessResponse } from './types/api.types'

// Constantes
const ONBOARDING_STEPS = {
  CHOOSING_COMPANY: "/onboarding/company",
  FINISH: "/onboarding/finish",
} as const

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password']
const API_URL = process.env.NEXT_PUBLIC_API_URL
const API_TIMEOUT = 5000

/**
 * Rafraîchit le token d'authentification
 */
async function refreshToken(request: NextRequest): Promise<NextResponse | boolean> {
  try {
    const response = await fetch(`${API_URL}/users/refresh-token`, {
      method: 'POST',
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
      credentials: 'include',
    });

    // Récupération du cookie set par l'API
    const cookie = response.headers.get('set-cookie');
    
    if (cookie) {
      // Création d'une réponse avec les cookies à transmettre
      const nextResponse = NextResponse.next();
      nextResponse.headers.set('Set-Cookie', cookie);
      return nextResponse;
    }
    
    return response.ok;
  } catch (error) {
    console.error("Erreur lors du rafraîchissement du token:", error);
    return false;
  }
}

/**
 * Récupère les détails de l'utilisateur
 */
async function getUserDetails(request: NextRequest): Promise<IApiSuccessResponse<IUser> | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(`${API_URL}/users/profile`, {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
      signal: controller.signal,
      cache: "no-store",
      credentials: 'include',
    });

    if (!response.ok) {
      const status = response.status;
      throw new Error(status === 401 ? "Unauthorized" : `Failed to fetch user data: ${status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Gère l'accès utilisateur en fonction de son état d'onboarding
 */
function handleUserAccess(request: NextRequest, user: IUser, path: string): NextResponse {
  // Gestion de l'onboarding
  if (!user.onboarding_completed) {
    const onboardingRedirectPath = ONBOARDING_STEPS[user.onboarding_step ?? "CHOOSING_COMPANY"];
    
    if (!path.startsWith("/onboarding") || path !== onboardingRedirectPath) {
      return redirectTo(request, onboardingRedirectPath);
    }
  } 
  // Redirection des utilisateurs qui ont complété l'onboarding mais accèdent aux pages d'onboarding
  else if (path.startsWith("/onboarding")) {
    return redirectTo(request, "/invoices");
  }
  
  return NextResponse.next();
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

  const hasAuthCookies = request.cookies.has('access_token');
  const hasRefreshToken = request.cookies.has('refresh_token');

  // Tentative de rafraîchissement du token si nécessaire
  if (!hasAuthCookies && hasRefreshToken) {
    const refreshResult = await refreshToken(request);

    if (!refreshResult) {
      return redirectTo(request, "/login");
    } else if (refreshResult instanceof NextResponse) {
      // Si on a reçu une NextResponse, on l'utilise pour transmettre les cookies
      return refreshResult;
    }
  }

  // Gestion des routes publiques
  if (PUBLIC_ROUTES.includes(path)) {
    // Redirection si déjà authentifié sur route publique
    if (hasAuthCookies) {
      try {
        const userData = await getUserDetails(request);
        if (userData?.data) {
          return redirectTo(request, '/invoices');
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du token sur route publique:", error);
      }
    }
    return NextResponse.next();
  }

  // Redirection vers login si pas authentifié
  if (!hasAuthCookies) {
    return redirectTo(request, "/login");
  }

  // Vérification des détails utilisateur pour les routes protégées
  try {
    const userData = await getUserDetails(request);
    
    if (!userData?.data) {
      return redirectTo(request, "/login");
    }
    
    return handleUserAccess(request, userData.data, path);
  } catch (error) {
    console.error("Erreur lors de la récupération des détails utilisateur:", error);
    return redirectTo(request, "/login");
  }
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