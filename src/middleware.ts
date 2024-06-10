import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCookie } from "cookies-next";
import { i18nRouter } from "next-i18n-router";
import i18nConfig from "../i18nConfig";

// Cette fonction peut être marquée `async` si l'utilisation de `await` est nécessaire à l'intérieur
export async function middleware(request: NextRequest) {
    // Utilisation de getCookie avec l'argument { req: request } pour récupérer le cookie côté serveur
    const token = getCookie("token", { req: request });

    if (request.nextUrl.pathname === "/") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    

    if (token && request.nextUrl.pathname.includes("/login")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Si le token n'existe pas et que l'utilisateur n'est pas déjà sur la page de login
    if (!token && request.nextUrl.pathname.includes("/dashboard")) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Retourne la réponse de i18nRouter pour gérer les routes internationales
    return i18nRouter(request, i18nConfig);
}

// Configuration pour matcher les chemins spécifiés, en excluant la route de login
export const config = {
    matcher: "/((?!api|static|.*\\..*|_next).*)",
};
