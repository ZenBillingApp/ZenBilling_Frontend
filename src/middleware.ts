import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { IUser } from '@/types/User.interface'
import { IApiSuccessResponse } from './types/api.types'

const ONBOARDING_STEPS = {
  CHOOSING_COMPANY: "/onboarding/company",
  FINISH: "/onboarding/finish",
}

const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password']

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
          throw new Error(response.status === 401 ? "Unauthorized" : `Failed to fetch user data: ${response.status}`);
      }

      return await response.json();
  } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
  } finally {
      clearTimeout(timeoutId);
  }
}

function handleUserAccess(request: NextRequest, user: IUser | undefined, path: string): NextResponse {
  if (!user) {
    return redirectTo(request, "/login");
  }

  const onboardingRedirectPath = ONBOARDING_STEPS[user?.onboarding_step ?? "CHOOSING_COMPANY"];

  if (!user.onboarding_completed) {
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
  const path = request.nextUrl.pathname;
  
  const token = request.cookies.get('token')?.value;

  if (publicRoutes.includes(path)) {
    if (token) {
      try {
        const userData = await GetUserDetails(token);
        if (userData?.data) {
          return NextResponse.redirect(new URL('/invoices', request.url));
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du token:", error);
      }
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const userData = await GetUserDetails(token);
    
    if (!userData || !userData.data) {
      const response = redirectTo(request, "/login");
      response.cookies.delete("token");
      return response;
    }
    
    return handleUserAccess(request, userData.data, path);
    
  } catch (error) {
    console.error("Erreur lors de la récupération des détails utilisateur:", error);
    const response = redirectTo(request, "/login");
    response.cookies.delete("token");
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/invoices/:path*',
    '/products/:path*',
    '/customers/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/onboarding/:path*'
  ]
} 