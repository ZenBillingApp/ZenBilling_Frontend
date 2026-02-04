"use client"

import { useAuth } from "@/providers/AuthProvider"
import { useActiveOrganization } from "@/hooks/useOrganization"
import { redirect } from "next/navigation"
import { useLayoutEffect } from "react"

/**
 * Dashboard Layout - State of the Art
 *
 * Utilise AuthProvider comme source de vérité unique
 * Le middleware gère déjà la protection des routes côté serveur
 * Ce layout gère les redirections côté client pour une UX fluide
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Source de vérité: AuthProvider
  const { user, isPending: isAuthPending, isAuthenticated } = useAuth()

  // Organisation active
  const { data: activeOrganization, isPending: isLoadingOrganization } = useActiveOrganization()

  useLayoutEffect(() => {
    // Attendre que le chargement soit terminé
    if (isAuthPending || isLoadingOrganization) return

    // Si authentifié mais pas d'organisation active
    if (isAuthenticated && user) {
      const currentPath = window.location.pathname

      // Rediriger vers sélection d'organisation si nécessaire
      if (!activeOrganization && !currentPath.startsWith("/select-organization")) {
        redirect("/select-organization")
      }
    }
  }, [isAuthPending, isLoadingOrganization, isAuthenticated, user, activeOrganization])

  // État de chargement
  if (isAuthPending || isLoadingOrganization) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mb-4" />
        <h2 className="text-xl font-semibold">Chargement de votre compte...</h2>
        <p className="mt-2 text-sm font-dmSans text-center text-muted-foreground">
          Veuillez patienter pendant que nous récupérons vos informations
        </p>
      </div>
    )
  }

  // Attente de l'utilisateur (le middleware devrait avoir redirigé si non authentifié)
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mb-4" />
      </div>
    )
  }

  return <>{children}</>
}
