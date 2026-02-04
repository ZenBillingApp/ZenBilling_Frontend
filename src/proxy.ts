import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { betterFetch } from "@better-fetch/fetch";

/**
 * Next.js Middleware - State of the Art Route Protection
 *
 * Fonctionnalités:
 * 1. Protection des routes côté serveur (pas de flash)
 * 2. Validation de session via Better Auth
 * 3. Gestion de l'onboarding flow
 * 4. Redirection intelligente
 */

// Routes publiques (pas besoin d'authentification)
const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

// Routes d'authentification (rediriger si déjà connecté)
const AUTH_ROUTES = ["/login", "/register"];

// Routes protégées qui nécessitent une organisation active
const ORG_REQUIRED_ROUTES = [
  "/dashboard",
  "/invoices",
  "/quotes",
  "/customers",
  "/products",
  "/settings",
];

// Routes d'onboarding
const ONBOARDING_ROUTES = ["/onboarding", "/select-organization"];

// Type pour la session Better Auth
interface Session {
  session: {
    id: string;
    userId: string;
    expiresAt: string;
    activeOrganizationId?: string;
  };
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

/**
 * Vérifie si le chemin correspond à une route publique
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Vérifie si le chemin correspond à une route d'authentification
 */
function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Vérifie si le chemin nécessite une organisation active
 */
function isOrgRequiredRoute(pathname: string): boolean {
  return ORG_REQUIRED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}


/**
 * Vérifie si le chemin est une ressource statique ou API
 */
function isStaticOrApiRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") // fichiers statiques (.ico, .png, etc.)
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorer les ressources statiques et API
  if (isStaticOrApiRoute(pathname)) {
    return NextResponse.next();
  }

  // Récupérer la session via Better Auth
  let session: Session | null = null;

  try {
    const response = await betterFetch<Session>(
      `${process.env.NEXT_PUBLIC_BETTER_AUTH_API_URL}/api/auth/get-session`,
      {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      }
    );

    if (response.data) {
      session = response.data;
    }
  } catch (error) {
    console.error("Erreur lors de la vérification de session:", error);
    session = null;
  }

  const isAuthenticated = !!session?.session && !!session?.user;
  const hasActiveOrg = !!session?.session?.activeOrganizationId;

  // Route publique de paiement - toujours accessible
  if (pathname.startsWith("/payment/")) {
    return NextResponse.next();
  }

  // Routes d'authentification: rediriger vers dashboard si déjà connecté
  if (isAuthRoute(pathname)) {
    if (isAuthenticated) {
      // Vérifier si une organisation est sélectionnée
      if (!hasActiveOrg) {
        return NextResponse.redirect(
          new URL("/select-organization", request.url)
        );
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Routes publiques: toujours accessibles
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // À partir d'ici, toutes les routes nécessitent une authentification

  // Non authentifié: rediriger vers login
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    // Sauvegarder l'URL de destination pour redirection après login
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Onboarding complété mais pas d'organisation sélectionnée
  if (
    !hasActiveOrg &&
    isOrgRequiredRoute(pathname) &&
    !pathname.startsWith("/select-organization")
  ) {
    return NextResponse.redirect(new URL("/select-organization", request.url));
  }

  // Empêcher l'accès à /select-organization si déjà une org active
  if (pathname === "/select-organization" && hasActiveOrg) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Configuration du matcher pour le middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
