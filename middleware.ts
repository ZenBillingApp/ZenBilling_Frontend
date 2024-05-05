import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCookie } from "cookies-next";

export function middleware(request: NextRequest) {
    const token = getCookie("token", { req: request }); // Fetch the cookie from the request

    if (!token) {
        return NextResponse.redirect("/login"); // Redirect to the login page if the cookie is not present
    }

    return NextResponse.next(); // Continue with the request processing
}

export const config = {
    matcher: ["/dashboard/:path*"],
};
