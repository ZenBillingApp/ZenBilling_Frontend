import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// Types
type OnboardingStep = "CHOOSING_COMPANY" | "CONTACT_INFO" | "FINISH";

interface User {
    onboarding_completed: boolean;
    onboarding_step?: OnboardingStep;
}

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

const ONBOARDING_STEPS: Record<OnboardingStep, string> = {
    CHOOSING_COMPANY: "/onboarding/choose-company",
    CONTACT_INFO: "/onboarding/contact-info",
    FINISH: "/dashboard",
};

const API_TIMEOUT = 5000;
const PUBLIC_PATHS = ["/login", "/register"];

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname.replace(/\/$/, "");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not defined");
    }
    
    const token = request.cookies.get("token")?.value;

    if (PUBLIC_PATHS.some(publicPath => path.startsWith(publicPath))) {
        if (token) {
            return redirectTo(request, "/dashboard");
        }
        return NextResponse.next();
    }

    if (!token) {
        return redirectTo(request, "/login");
    }

    try {
        const user = await fetchUser(apiUrl, token);
        return handleUserAccess(request, user, path);
    } catch (error) {
       
            const response = redirectTo(request, "/login");
            response.cookies.delete("token");
            return response;
        
    }
}

async function fetchUser(apiUrl: string, token: string): Promise<User> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
        const response = await fetch(`${apiUrl}/user`, {
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

function handleUserAccess(request: NextRequest, user: User, path: string): NextResponse {
    const onboardingRedirectPath = ONBOARDING_STEPS[user.onboarding_step ?? "CHOOSING_COMPANY"];

    if (!user.onboarding_completed) {
        if (!path.startsWith("/onboarding") || path !== onboardingRedirectPath) {
            return redirectTo(request, onboardingRedirectPath);
        }
    } else if (path.startsWith("/onboarding")) {
        return redirectTo(request, "/dashboard");
    }

    return NextResponse.next();
}

function redirectTo(request: NextRequest, path: string): NextResponse {
    return NextResponse.redirect(new URL(path, request.url));
}