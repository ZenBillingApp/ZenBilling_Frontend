"use client"

import { useRouter } from "next/navigation"
import { authClient, invalidateTokenCache } from "@/lib/auth-client"
import { useAuthStore } from "@/stores/authStores"
import { useQueryClient } from "@tanstack/react-query"

/**
 * Hook de déconnexion - State of the Art
 *
 * Gère proprement:
 * 1. Invalidation du cache token mémoire
 * 2. Nettoyage du store Zustand
 * 3. Nettoyage du cache TanStack Query
 * 4. Déconnexion Better Auth (cookies)
 * 5. Redirection
 */
export function useLogout() {
  const router = useRouter()
  const clearAuth = useAuthStore.getState().clearAuth
  const queryClient = useQueryClient()

  const logout = async (redirectTo: string = "/login") => {
    try {
      // 1. Invalider le cache token mémoire immédiatement
      invalidateTokenCache()

      // 2. Nettoyer le store Zustand
      clearAuth()

      // 3. Nettoyer le cache TanStack Query
      queryClient.clear()

      // 4. Déconnexion côté serveur (Better Auth)
      await authClient.signOut()

      // 5. Redirection
      router.push(redirectTo)
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
      // Forcer la redirection même en cas d'erreur
      window.location.href = redirectTo
    }
  }

  return { logout }
}
