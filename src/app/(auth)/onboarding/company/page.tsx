import { CompanyForm } from "@/components/company-form"
import { LogoutButton } from "@/components/logout-button"

export default function CompanyOnboardingPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-4 md:p-6 lg:p-10">
      <div className="absolute top-4 right-4">
        <LogoutButton />
      </div>
      <div className="w-full max-w-2xl rounded-lg border border-border bg-card p-4 md:p-6 shadow-sm">
        <CompanyForm />
      </div>
    </div>
  )
}
