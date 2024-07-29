import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCookie } from "cookies-next";

export async function middleware(request: NextRequest) {
    const token = getCookie("token", { req: request });

    const publicPaths = ["/login", "/register"];

    // Redirection vers login si pas de token
    if (!token && !publicPaths.includes(request.nextUrl.pathname)) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Redirection vers dashboard/home si token valide
    const url = request.nextUrl.pathname;

    if (token && (publicPaths.includes(url) || !url.includes("/dashboard/"))) {
        return NextResponse.redirect(new URL("/dashboard/home", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/login", "/register", "/"],
};
