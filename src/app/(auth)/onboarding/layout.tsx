import { OnboardingProvider } from "@/providers/OnboardingProvider"

export default function OnboardingLayout({children}: {children: React.ReactNode}) {
    return <OnboardingProvider>
        {children}
    </OnboardingProvider>
}