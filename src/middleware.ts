import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// Types
type OnboardingStep = 'CHOOSING_COMPANY' | 'CONTACT_INFO' | 'FINISHED';

interface User {
  onboarding_completed: boolean;
  onboarding_step?: OnboardingStep;
}

interface ApiError extends Error {
  status?: number;
}

// Configuration
export const config = {
  matcher: [
    '/customers/:path*',
    '/dashboard',
    '/invoices/:path*',
    '/my-company',
    '/login',
    '/onboarding/:path*',
  ],
};

const ONBOARDING_STEPS: Readonly<Record<OnboardingStep, string>> = {
  CHOOSING_COMPANY: '/onboarding/choose-company',
  CONTACT_INFO: '/onboarding/contact-info',
  FINISHED: '/dashboard',
} as const;

const API_TIMEOUT = 5000;
const PUBLIC_PATHS = new Set(['/login', '/onboarding']);

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Permettre l'accès aux chemins publics sans token
  if (PUBLIC_PATHS.has(path)) {
    const token = request.cookies.get('token')?.value;
    if (token && path === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  try {
    await validateEnvironment();
    const user = await authenticateAndGetUser(request);
    return handleUserAccess(request, user, path);
  } catch (error) {
    return handleMiddlewareError(request, error);
  }
}

async function validateEnvironment(): Promise<void> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error('Configuration error: NEXT_PUBLIC_API_URL is missing');
  }
}

async function authenticateAndGetUser(request: NextRequest): Promise<User> {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    const error = new Error('Authentication required') as ApiError;
    error.status = 401;
    throw error;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
  return await fetchUserWithTimeout(apiUrl, token);
}

async function fetchUserWithTimeout(apiUrl: string, token: string): Promise<User> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(`${apiUrl}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = new Error(`API error: ${response.status} ${response.statusText}`) as ApiError;
      error.status = response.status;
      throw error;
    }

    const userData: User = await response.json();
    validateUserData(userData);
    return userData;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`API timeout after ${API_TIMEOUT}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function validateUserData(userData: unknown): asserts userData is User {
  if (!userData || typeof userData !== 'object') {
    throw new Error('Invalid user data format');
  }

  const user = userData as Partial<User>;
  if (typeof user.onboarding_completed !== 'boolean') {
    throw new Error('Missing or invalid onboarding_completed status');
  }
}

function handleUserAccess(request: NextRequest, user: User, path: string): NextResponse {
  // Si l'utilisateur n'a pas terminé l'onboarding et n'est pas sur une page d'onboarding
  if (!user.onboarding_completed && !path.startsWith('/onboarding')) {
    return redirectToOnboarding(request, user.onboarding_step);
  }

  // Si l'utilisateur a terminé l'onboarding et est sur une page d'onboarding
  if (user.onboarding_completed && path.startsWith('/onboarding')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

function redirectToOnboarding(request: NextRequest, step?: OnboardingStep): NextResponse {
  const redirectPath = step && ONBOARDING_STEPS[step] 
    ? ONBOARDING_STEPS[step] 
    : '/onboarding';
  return NextResponse.redirect(new URL(redirectPath, request.url));
}

function redirectToLogin(request: NextRequest, path: string): NextResponse {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('callbackUrl', encodeURIComponent(path));
  return NextResponse.redirect(loginUrl);
}

function handleMiddlewareError(request: NextRequest, error: unknown): NextResponse {
  console.error('Middleware error:', error);

  const loginUrl = new URL('/login', request.url);
  const isApiError = error instanceof Error && (error as ApiError).status;

  if (isApiError) {
    const apiError = error as ApiError;
    if (apiError.status === 401) {
      loginUrl.searchParams.set('error', 'session_expired');
    } else {
      loginUrl.searchParams.set('error', 'api_error');
    }
  } else {
    loginUrl.searchParams.set('error', 'unknown_error');
  }

  loginUrl.searchParams.set(
    'message',
    error instanceof Error ? error.message : 'Une erreur inattendue est survenue'
  );

  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete('token');

  return response;
}