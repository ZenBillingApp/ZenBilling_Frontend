import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { IUser } from '@/types/User.interface'
import { IApiSuccessResponse } from './types/api.types'

const ONBOARDING_STEPS = {
  CHOOSING_COMPANY: "/onboarding/company",
  FINISH: "/onboarding/finish",
}


const publicRoutes = ['/login', '/register']

const API_URL = process.env.NEXT_PUBLIC_API_URL


async function GetUserDetails(token: string | undefined): Promise<IApiSuccessResponse<IUser> | null> {
  if (!token) return null;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
      const response = await fetch(`${API_URL}/users/profile`, {
          headers: {
              Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
          cache: "no-store",
      });

      if (!response.ok) {
          throw new Error(response.status === 401 ? "Unauthorized" : "Failed to fetch user data");
      }

      return await response.json();
  } finally {
      clearTimeout(timeoutId);
  }
}

function handleUserAccess(request: NextRequest, user: IUser | undefined, path: string): NextResponse {
  const onboardingRedirectPath = ONBOARDING_STEPS[user?.onboarding_step ?? "CHOOSING_COMPANY"];
  console.log("onboarding completed", user?.onboarding_completed)
  console.log("onboarding redirect path", onboardingRedirectPath)
  console.log("path", path)
  
  // Vérifier si l'utilisateur a terminé l'onboarding
  if (!user?.onboarding_completed) {
    // Si l'utilisateur est sur la page "finish" de l'onboarding, le laisser continuer
    if (path === "/onboarding/finish") {
      return NextResponse.next();
    }
    
    // Sinon, rediriger vers l'étape appropriée de l'onboarding
    if (!path.startsWith("/onboarding") || path !== onboardingRedirectPath) {
      return redirectTo(request, onboardingRedirectPath);
    }
  } 
  else if (path.startsWith("/onboarding")) {
    return redirectTo(request, "/invoices");
  }

  return NextResponse.next();
}

function redirectTo(request: NextRequest, path: string): NextResponse {
  return NextResponse.redirect(new URL(path, request.url));
}



export default async function middleware(request: NextRequest) {
  // Récupérer le token depuis le localStorage
  const token = request.cookies.get('token')?.value

  // Vérifier si l'utilisateur tente d'accéder à une route protégée
  
    if (!token && !publicRoutes.includes(request.nextUrl.pathname)) {
      // Rediriger vers la page de connexion si pas de token
      return NextResponse.redirect(new URL('/login', request.url))
    }
  

  // Rediriger vers le dashboard si l'utilisateur est déjà connecté et essaie d'accéder à /login
  if (request.nextUrl.pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/invoices', request.url))
  }

  try {
      const user = await GetUserDetails(token);
      console.log(user)
      if (user) {
        return handleUserAccess(request, user.data, request.nextUrl.pathname);
      }
  } catch (error) {
    console.error("Erreur lors de la récupération des détails utilisateur:", error);
   
        const response = redirectTo(request, "/login");
        response.cookies.delete("token");
        return response;
    
}


  return NextResponse.next()
}

// Configurer les chemins à matcher
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/invoices/:path*',
    '/products/:path*',
    '/customers/:path*',
    '/login',
    '/register',
    '/onboarding/:path*'
  ]
} 