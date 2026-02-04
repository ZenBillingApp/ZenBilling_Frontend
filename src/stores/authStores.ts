"use client"
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { IStoredUser, IOnboardingStep } from "@/types/User.interface";

/**
 * Auth Store - State of the Art
 *
 * Principes:
 * 1. Ce store ne gère PAS l'authentification (Better Auth le fait via cookies)
 * 2. Il stocke uniquement les données utilisateur étendues pour un accès rapide
 * 3. La source de vérité reste Better Auth useSession()
 * 4. Persistance via sessionStorage (plus sécurisé)
 */

interface IAuthState {
  // Données utilisateur étendues (cache local)
  user: IStoredUser | null;
  // Flag dérivé - synchronisé via AuthProvider
  isAuthenticated: boolean;
}

interface IAuthActions {
  /**
   * Met à jour les données utilisateur dans le store
   * Appelé par AuthProvider lors de la synchronisation
   */
  setAuth: (data: IStoredUser) => void;

  /**
   * Met à jour partiellement les données utilisateur
   */
  updateUser: (data: Partial<IStoredUser>) => void;

  /**
   * Efface toutes les données d'authentification
   * Appelé lors du logout
   */
  clearAuth: () => void;
}

export const useAuthStore = create<IAuthState & IAuthActions>()(
  persist(
    (set) => ({
      // État initial
      user: null,
      isAuthenticated: false,

      // Actions
      setAuth: (data: IStoredUser) => {
        set({
          user: {
            id: data.id,
            email: data.email,
            first_name: data.first_name,
            last_name: data.last_name,
            image: data.image,
            company_id: data.company_id,
            onboarding_completed: data.onboarding_completed,
            onboarding_step: data.onboarding_step as IOnboardingStep | null,
            stripe_account_id: data.stripe_account_id,
            stripe_onboarded: data.stripe_onboarded,
          },
          isAuthenticated: true,
        });
      },

      updateUser: (data: Partial<IStoredUser>) => {
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                ...data,
              }
            : null,
        }));
      },

      clearAuth: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "auth-storage",
      // Utiliser sessionStorage pour plus de sécurité
      storage: createJSONStorage(() => sessionStorage),
      // Ne persister que les données nécessaires
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * Sélecteur pour obtenir uniquement l'utilisateur
 */
export const useUser = () => useAuthStore((state) => state.user);

/**
 * Sélecteur pour vérifier l'authentification
 * Note: Préférer useAuth() de AuthProvider pour une source de vérité fiable
 */
export const useIsAuthenticatedStore = () =>
  useAuthStore((state) => state.isAuthenticated);
