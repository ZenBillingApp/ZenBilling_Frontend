"use client";

import { createContext, useContext, useEffect, useMemo, ReactNode } from "react";
import { authClient } from "@/lib/auth-client";
import { useAuthStore } from "@/stores/authStores";
import type { IStoredUser, IOnboardingStep } from "@/types/User.interface";

/**
 * AuthProvider - State of the Art Authentication Context
 *
 * Principes:
 * 1. Better Auth useSession() comme source de vérité unique
 * 2. Synchronisation automatique avec le store Zustand (données étendues)
 * 3. Pas de flash de contenu non autorisé grâce à isPending
 * 4. Hydratation propre pour le SSR
 */

// Type pour l'utilisateur Better Auth avec champs additionnels
type BetterAuthUser = {
  id: string;
  email: string;
  name?: string;
  image?: string | null;
  first_name?: string;
  last_name?: string;
  company_id?: string;
  onboarding_completed?: boolean;
  onboarding_step?: string;
  stripe_account_id?: string;
  stripe_onboarded?: boolean;
};

// Type pour la session Better Auth
type BetterAuthSession = {
  id: string;
  userId: string;
  expiresAt: Date;
  activeOrganizationId?: string;
};

// Types pour le contexte
interface AuthContextType {
  // État de la session Better Auth
  session: BetterAuthSession | null;
  user: BetterAuthUser | null;

  // États de chargement
  isPending: boolean;
  isRefetching: boolean;

  // État d'authentification dérivé
  isAuthenticated: boolean;

  // Actions
  refetch: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Source de vérité unique: Better Auth useSession
  const {
    data: sessionData,
    isPending,
    isRefetching,
    refetch,
  } = authClient.useSession();

  // Store Zustand pour les données utilisateur étendues
  const { setAuth, clearAuth } = useAuthStore();

  // Extraire session et user avec typage explicite
  const session = (sessionData?.session as BetterAuthSession) ?? null;
  const user = (sessionData?.user as BetterAuthUser) ?? null;
  const isAuthenticated = !!session && !!user;

  // Synchroniser avec le store Zustand quand la session change
  useEffect(() => {
    if (isAuthenticated && user) {
      // Mapper les données Better Auth vers le format du store
      const storedUser: IStoredUser = {
        id: user.id,
        email: user.email,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        image: user.image,
        company_id: user.company_id,
        onboarding_completed: user.onboarding_completed,
        onboarding_step: user.onboarding_step as IOnboardingStep,
        stripe_account_id: user.stripe_account_id,
        stripe_onboarded: user.stripe_onboarded,
      };
      setAuth(storedUser);
    } else if (!isPending && !isAuthenticated) {
      // Session terminée, nettoyer le store
      clearAuth();
    }
  }, [isAuthenticated, user, isPending, setAuth, clearAuth]);

  // Actions
  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      clearAuth();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const handleRefetch = async () => {
    await refetch();
  };

  // Mémoiser la valeur du contexte
  const contextValue = useMemo<AuthContextType>(
    () => ({
      session,
      user,
      isPending,
      isRefetching,
      isAuthenticated,
      refetch: handleRefetch,
      signOut: handleSignOut,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session, user, isPending, isRefetching, isAuthenticated]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook pour utiliser le contexte d'authentification
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

/**
 * Hook pour vérifier si l'utilisateur est authentifié
 * Retourne aussi l'état de chargement pour éviter les flashs
 */
export function useIsAuthenticated(): {
  isAuthenticated: boolean;
  isPending: boolean;
} {
  const { isAuthenticated, isPending } = useAuth();
  return { isAuthenticated, isPending };
}

/**
 * Hook pour obtenir l'utilisateur courant
 * Retourne null si non authentifié ou en chargement
 */
export function useCurrentUser() {
  const { user, isPending, isAuthenticated } = useAuth();

  if (isPending || !isAuthenticated) {
    return null;
  }

  return user;
}
