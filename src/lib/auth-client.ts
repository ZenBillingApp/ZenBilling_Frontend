import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, inferOrgAdditionalFields, organizationClient, jwtClient } from "better-auth/client/plugins";

/**
 * Auth Client Configuration - State of the Art
 *
 * Principes appliqués:
 * 1. PAS de stockage du JWT côté client (vulnérable XSS)
 * 2. Better Auth gère les sessions via cookies httpOnly (sécurisé)
 * 3. Le JWT est récupéré à la demande via authClient.token()
 * 4. Cache mémoire court terme pour éviter les appels répétés
 */

// Cache mémoire pour le JWT (pas de persistance, sécurisé)
let tokenCache: { token: string; expiresAt: number } | null = null;
const TOKEN_CACHE_DURATION = 4 * 60 * 1000; // 4 minutes (avant expiration typique de 5min)

/**
 * Récupère le JWT avec cache mémoire
 * Le token n'est JAMAIS persisté dans localStorage/sessionStorage
 */
export async function getJwtToken(): Promise<string | null> {
    // Vérifier le cache mémoire
    if (tokenCache && Date.now() < tokenCache.expiresAt) {
        return tokenCache.token;
    }

    try {
        const { data, error } = await authClient.token();

        if (error || !data?.token) {
            tokenCache = null;
            return null;
        }

        // Mettre en cache mémoire (court terme)
        tokenCache = {
            token: data.token,
            expiresAt: Date.now() + TOKEN_CACHE_DURATION,
        };

        return data.token;
    } catch {
        tokenCache = null;
        return null;
    }
}

/**
 * Invalide le cache du token (à appeler lors du logout)
 */
export function invalidateTokenCache(): void {
    tokenCache = null;
}

/**
 * Vérifie si l'utilisateur a une session active
 * Utilise le cookie httpOnly géré par Better Auth
 */
export async function hasActiveSession(): Promise<boolean> {
    try {
        const session = await authClient.getSession();
        return !!session.data?.session;
    } catch {
        return false;
    }
}

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_API_URL,
    plugins: [
        jwtClient(),
        inferAdditionalFields({
            user: {
                first_name: {
                    type: "string",
                    required: true,
                },
                last_name: {
                    type: "string",
                    required: true,
                },
                company_id: {
                    type: "string",
                    required: false,
                },
                onboarding_completed: {
                    type: "boolean",
                    required: false,
                },
                onboarding_step: {
                    type: "string",
                    required: false,
                },
                stripe_account_id: {
                    type: "string",
                    required: false,
                },
                stripe_onboarded: {
                    type: "boolean",
                    required: false,
                },
            },
        }),
        organizationClient({
             schema: inferOrgAdditionalFields({
        organization: {
          additionalFields: {
                        siret: {
                            type: "string",
                            required: true,
                        },
                        tva_intra: {
                            type: "string",
                            required: false,
                        },
                        tva_applicable: {
                            type: "boolean",
                            required: true,
                        },
                        RCS_number: {
                            type: "string",
                            required: true,
                        },
                        RCS_city: {
                            type: "string",
                            required: true,
                        },
                        capital: {
                            type: "number",
                            required: false,
                        },
                        siren: {
                            type: "string",
                            required: true,
                        },
                        legal_form: {
                            type: "string",
                            required: true,
                        },
                        address: {
                            type: "string",
                            required: true,
                        },
                        postal_code: {
                            type: "string",
                            required: true,
                        },
                        city: {
                            type: "string",
                            required: true,
                        },
                        country: {
                            type: "string",
                            required: true,
                        },
                        email: {
                            type: "string",
                            required: false,
                        },
                        phone: {
                            type: "string",
                            required: false,
                        },
                        website: {
                            type: "string",
                            required: false,
                        },
                        stripe_account_id: {
                            type: "string",
                            required: false,
                        },
                        stripe_onboarded: {
                            type: "boolean",
                            required: false,
                        },
                    },
                },
            },
        
)}), 
    ],
});

// Traductions françaises des codes d'erreur
export const errorCodesFR = {
    USER_ALREADY_EXISTS: "L'utilisateur existe déjà",
    INVALID_CREDENTIALS: "Identifiants invalides",
    INVALID_EMAIL_OR_PASSWORD: "Email ou mot de passe invalide",
    INVALID_EMAIL: "Email invalide",
    INVALID_PASSWORD: "Mot de passe invalide",
    USER_NOT_FOUND: "Utilisateur non trouvé",
    EMAIL_NOT_VERIFIED: "Email non vérifié",
    TOKEN_EXPIRED: "Jeton expiré",
    TOKEN_INVALID: "Jeton invalide",
    MISSING_FIELDS: "Champs manquants",
    UNAUTHORIZED: "Non autorisé",
    SESSION_EXPIRED: "Session expirée",
    INTERNAL_ERROR: "Erreur interne du serveur",
    RATE_LIMITED: "Trop de tentatives, veuillez réessayer plus tard"
} as const;

// Type pour les codes d'erreur
export type ErrorCodeKey = keyof typeof errorCodesFR;

// Fonction utilitaire pour obtenir le message d'erreur en français
export const getErrorMessageFR = (errorCode: string): string => {
    return (errorCode in errorCodesFR) 
        ? errorCodesFR[errorCode as ErrorCodeKey] 
        : "Une erreur s'est produite";
};

export const { signIn, signUp, useSession } = authClient;