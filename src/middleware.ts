import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCookie } from "cookies-next";
import { i18nRouter } from "next-i18n-router";
import i18nConfig from "../i18nConfig";

const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(request: NextRequest) {
    const token = getCookie("token", { req: request });

    // Extraction de la locale depuis l'URL
    const pathnameParts = request.nextUrl.pathname.split("/");
    const locale = i18nConfig.locales.includes(pathnameParts[1])
        ? pathnameParts[1]
        : i18nConfig.defaultLocale;

    // List of protected routes
    const protectedRoutes = [
        "dashboard",
        "invoices",
        "customers",
        "my-company",
        "profile",
    ];

    // Check if the current path is a protected route
    const isProtectedRoute = protectedRoutes.some((route) =>
        request.nextUrl.pathname.includes(route)
    );

    if (
        request.nextUrl.pathname.startsWith("/_next") ||
        request.nextUrl.pathname.includes("/api/") ||
        PUBLIC_FILE.test(request.nextUrl.pathname)
    ) {
        return NextResponse.next();
    }

    if (request.nextUrl.locale === "default") {
        const locale = request.cookies.get("NEXT_LOCALE")?.value || "en";
        return NextResponse.redirect(
            new URL(
                `/${locale}${request.nextUrl.pathname}${request.nextUrl.search}`,
                request.url
            )
        );
    }

    if (request.nextUrl.pathname === `/${locale}`) {
        return NextResponse.redirect(
            new URL(`/${locale}/dashboard`, request.url)
        );
    }

    if (token && request.nextUrl.pathname.includes("/login")) {
        return NextResponse.redirect(
            new URL(`/${locale}/dashboard`, request.url)
        );
    }

    if (!token && isProtectedRoute) {
        return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    return i18nRouter(request, i18nConfig);
}

export const config = {
    matcher: "/((?!api|static|.*\\..*|_next).*)",
};
