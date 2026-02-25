"use client"

import { useUser } from "@/hooks/useUser"
import { useAuthStore } from "@/stores/authStores"
import { redirect } from "next/navigation"
import { useLayoutEffect } from "react"

export default function DashboardLayout({children}: {children: React.ReactNode}) {
  const { isLoading, isError } = useUser()
  const { user, isAuthenticated } = useAuthStore()
  
  useLayoutEffect(() => {
    // Si les données utilisateur sont chargées et certaines conditions ne sont pas remplies
    if (!isLoading && isAuthenticated && user) {
      // Vérifier si l'onboarding est terminé
      if (!user.onboarding_completed && user.onboarding_step) {
        const onboardingRoutes = {
          CHOOSING_COMPANY: "/onboarding/company",
          FINISH: "/onboarding/finish",
          STRIPE_SETUP: "/onboarding/stripe",
        }
        
        const currentPath = window.location.pathname
        const targetPath = onboardingRoutes[user.onboarding_step]
        
        // Rediriger uniquement si l'utilisateur n'est pas déjà sur la bonne route d'onboarding
        if (targetPath && !currentPath.startsWith(targetPath)) {
          redirect(targetPath)
        }
      }
    }
  }, [isLoading, isError, isAuthenticated, user])
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen" role="status">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mb-4" aria-hidden="true"></div>
        <h2 className="text-xl font-semibold text-white">Chargement de votre compte...</h2>
        <p className="text-white mt-2 text-sm font-dmSans text-center">Veuillez patienter pendant que nous récupérons vos informations</p>
      </div>
    )
  }
  
  if (!user) {
    return <div className="flex flex-col items-center justify-center min-h-screen" role="status">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mb-4" aria-hidden="true"></div>
    <span className="sr-only">Chargement en cours...</span>
  </div>
  }
  
  return <>{children}</>
}

