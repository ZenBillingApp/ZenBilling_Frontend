"use client";

import { useEffect } from "react";
import { usePathname,redirect } from "next/navigation";
import { IOnboardingStep } from "@/types/User.interface";
import { useProfile } from "@/hooks/useAuth";

const ONBOARDING_STEPS: Record<IOnboardingStep, string> = {
  CHOOSING_COMPANY: "/onboarding/company",
  FINISH: "/onboarding/finish",
} as const;

export const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {  
  const pathname = usePathname();
  const { data: profileData } = useProfile();

  useEffect(() => {
    // Si l'utilisateur n'est pas connecté, on ne fait rien
    if (!profileData) return;

    console.log(profileData?.data);
    // Utiliser les données du profil pour une vérification plus précise
    const currentUser = profileData?.data;

    // Si l'onboarding est complété, on redirige vers le dashboard
    if (currentUser.onboarding_completed) {
      if (pathname.startsWith("/onboarding")) {
        redirect("/dashboard");
      }
      return;
    }

    // Si l'onboarding n'est pas complété, on vérifie si l'utilisateur est sur la bonne étape
    const currentStep = currentUser.onboarding_step as IOnboardingStep;
    if (!currentStep) return;

    const expectedPath = ONBOARDING_STEPS[currentStep];

    if (pathname !== expectedPath) {
      redirect(expectedPath);
    }
  }, [pathname, profileData]);

  return <>{children}</>;
};