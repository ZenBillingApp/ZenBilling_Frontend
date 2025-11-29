"use client"

import { useUser } from "@/hooks/useUser"
import { useAuthStore } from "@/stores/authStores"
import { redirect } from "next/navigation"
import { useLayoutEffect } from "react"
import { useActiveOrganization } from "@/hooks/useOrganization"

export default function DashboardLayout({children}: {children: React.ReactNode}) {
  const { isLoading, isError } = useUser()
  const { user, isAuthenticated } = useAuthStore()
  const { data: activeOrganization, isPending: isLoadingOrganization } = useActiveOrganization()

  useLayoutEffect(() => {
    // Si les données utilisateur sont chargées et certaines conditions ne sont pas remplies
    if (!isLoading && isAuthenticated && user) {

      // Vérifier si l'utilisateur a une organisation active
      // Ne pas rediriger si on est déjà sur la page de sélection d'organisation
      const currentPath = window.location.pathname
      if (!isLoadingOrganization &&
          !activeOrganization &&
          !currentPath.startsWith("/select-organization")) {
        redirect("/select-organization")
      }
    }
  }, [isLoading, isError, isAuthenticated, user, activeOrganization, isLoadingOrganization])

  if (isLoading || isLoadingOrganization) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mb-4"></div>
        <h2 className="text-xl font-semibold text-white">Chargement de votre compte...</h2>
        <p className="text-white mt-2 text-sm font-dmSans text-center">Veuillez patienter pendant que nous récupérons vos informations</p>
      </div>
    )
  }

  if (!user) {
    return <div className="flex flex-col items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mb-4"></div>
  </div>
  }

  return <>{children}</>
}

