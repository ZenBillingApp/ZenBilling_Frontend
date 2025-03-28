"use client";

import { useLayoutEffect } from "react";
import { useAuthStore } from "@/stores/authStores";
import { useRouter, usePathname } from "next/navigation";
import { IOnboardingStep } from "@/types/User.interface";

const ONBOARDING_STEPS: Record<IOnboardingStep, string> = {
  CHOOSING_COMPANY: "/onboarding/company",
  FINISH: "/onboarding/finish",
} as const;

export const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useLayoutEffect(() => {
    // Si l'utilisateur n'est pas connecté, on ne fait rien
    if (!user) return;

    // Si l'onboarding est complété, on redirige vers le dashboard
    if (user.onboarding_completed) {
      if (pathname.startsWith("/onboarding")) {
        router.replace("/invoices");
      }
      return;
    }

    // Si l'onboarding n'est pas complété, on vérifie si l'utilisateur est sur la bonne étape
    const currentStep = user.onboarding_step;
    if (!currentStep) return;

    const expectedPath = ONBOARDING_STEPS[currentStep];

    if (pathname !== expectedPath) {
      router.replace(expectedPath);
    }
  }, [router, user, pathname]);

  return <>{children}</>;
};