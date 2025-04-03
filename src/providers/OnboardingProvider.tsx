"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStores";
import { useRouter, usePathname } from "next/navigation";
import { IOnboardingStep } from "@/types/User.interface";
import { useProfile } from "@/hooks/useAuth";

const ONBOARDING_STEPS: Record<IOnboardingStep, string> = {
  CHOOSING_COMPANY: "/onboarding/company",
  FINISH: "/onboarding/finish",
} as const;

export const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const { data: profileData } = useProfile();

  useEffect(() => {
    // Si l'utilisateur n'est pas connecté, on ne fait rien
    if (!user) return;

    // Utiliser les données du profil pour une vérification plus précise
    const currentUser = profileData?.data || user;

    // Si l'onboarding est complété, on redirige vers le dashboard
    if (currentUser.onboarding_completed) {
      if (pathname.startsWith("/onboarding")) {
        router.replace("/invoices");
      }
      return;
    }

    // Si l'onboarding n'est pas complété, on vérifie si l'utilisateur est sur la bonne étape
    const currentStep = currentUser.onboarding_step as IOnboardingStep;
    if (!currentStep) return;

    const expectedPath = ONBOARDING_STEPS[currentStep];

    if (pathname !== expectedPath) {
      router.replace(expectedPath);
    }
  }, [router, user, pathname, profileData]);

  return <>{children}</>;
};