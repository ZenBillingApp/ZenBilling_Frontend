import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// Types
type OnboardingStep = "CHOOSING_COMPANY" | "CONTACT_INFO" | "FINISH";

interface User {
    onboarding_completed: boolean;
    onboarding_step?: OnboardingStep;
}

class ApiError extends Error {
    status?: number;
    constructor(message: string, status?: number) {
        super(message);
        this.status = status;
    }
}

// Configuration
export const config = {
    matcher: [
        "/customers/:path*",
        "/dashboard",
        "/invoices/:path*",
        "/my-company",
        "/login",
        "/register",
        "/onboarding/:path*",
    ],
};

const ONBOARDING_STEPS: Readonly<Record<OnboardingStep, string>> = {
    CHOOSING_COMPANY: "/onboarding/choose-company",
    CONTACT_INFO: "/onboarding/contact-info",
    FINISH: "/dashboard",
} as const;

const API_TIMEOUT = 5000;
const PUBLIC_PATHS = new Set(["/login", "/register"]);

// Middleware principal
export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname.replace(/\/$/, ""); // Normalisation du chemin

    if (isPublicPath(path)) {
        return handlePublicPath(request, path);
    }

    try {
        await validateEnvironment();
        const user = await authenticateAndGetUser(request);
        return handleUserAccess(request, user, path);
    } catch (error) {
        return handleMiddlewareError(request, error);
    }
}

// Chemins publics
function isPublicPath(path: string): boolean {
    return Array.from(PUBLIC_PATHS).some((publicPath) =>
        path.startsWith(publicPath)
    );
}

function handlePublicPath(request: NextRequest, path: string): NextResponse {
    const token = request.cookies.get("token")?.value;

    if (token && isPublicPath(path)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

// Validation de l'environnement
async function validateEnvironment(): Promise<void> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
        throw new Error("Configuration error: NEXT_PUBLIC_API_URL is missing");
    }
}

// Authentification et récupération des données utilisateur
async function authenticateAndGetUser(request: NextRequest): Promise<User> {
    const token = request.cookies.get("token")?.value;
    if (!token) {
        throw new ApiError("Authentication required", 401);
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
    return fetchUserWithTimeout(apiUrl, token);
}

async function fetchUserWithTimeout(
    apiUrl: string,
    token: string
): Promise<User> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
        const response = await fetch(`${apiUrl}/user`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            method: "GET",
            signal: controller.signal,
            cache: "no-store",
        });

        if (!response.ok) {
            throw new ApiError(
                `API error: ${response.status} ${response.statusText}`,
                response.status
            );
        }

        const userData: User = await response.json();
        validateUserData(userData);
        return userData;
    } finally {
        clearTimeout(timeoutId);
    }
}

function validateUserData(userData: unknown): asserts userData is User {
    if (!userData || typeof userData !== "object") {
        throw new Error("Invalid user data format");
    }

    const user = userData as Partial<User>;
    if (typeof user.onboarding_completed !== "boolean") {
        throw new Error("Missing or invalid onboarding_completed status");
    }

    if (
        user.onboarding_step &&
        !Object.keys(ONBOARDING_STEPS).includes(user.onboarding_step)
    ) {
        console.log("user.onboarding_step", user.onboarding_step);
        throw new Error("Invalid onboarding_step value");
    }
}

// Gestion des accès utilisateur
function handleUserAccess(
    request: NextRequest,
    user: User,
    path: string
): NextResponse {
    if (!user.onboarding_completed && !path.startsWith("/onboarding")) {
        return redirectTo(
            request,
            getOnboardingRedirectPath(user.onboarding_step)
        );
    }

    if (user.onboarding_completed && path.startsWith("/onboarding")) {
        return redirectTo(request, "/dashboard");
    }

    if (
        !user.onboarding_completed &&
        path.startsWith("/onboarding") &&
        path !== getOnboardingRedirectPath(user.onboarding_step)
    ) {
        return redirectTo(
            request,
            getOnboardingRedirectPath(user.onboarding_step)
        );
    }

    return NextResponse.next();
}

function getOnboardingRedirectPath(step?: OnboardingStep): string {
    return step && ONBOARDING_STEPS[step]
        ? ONBOARDING_STEPS[step]
        : "/onboarding/choose-company";
}

// Redirections centralisées
function redirectTo(request: NextRequest, path: string): NextResponse {
    return NextResponse.redirect(new URL(path, request.url));
}

// Gestion des erreurs
function handleMiddlewareError(
    request: NextRequest,
    error: unknown
): NextResponse {
    console.error("Middleware error:", error);

    const loginUrl = new URL("/login", request.url);
    if (error instanceof ApiError) {
        if (error.status === 401) {
            loginUrl.searchParams.set("error", "session_expired");
        } else {
            loginUrl.searchParams.set("error", "api_error");
        }
    } else {
        loginUrl.searchParams.set("error", "unknown_error");
    }

    loginUrl.searchParams.set(
        "message",
        error instanceof Error
            ? error.message
            : "Une erreur inattendue est survenue"
    );

    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("token");
    return response;
}
