import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    plugins: [
        inferAdditionalFields({
            user: {
                first_name: {
                    type: "string",
                },
                last_name: {
                    type: "string",
                },
                onboarding_completed: {
                    type: "boolean",
                    required: false,
                },
                onboarding_step: {
                    type: "string",
                    required: false,
                },
            },
        }),
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