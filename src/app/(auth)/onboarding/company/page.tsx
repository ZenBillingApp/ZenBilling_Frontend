import { CompanyForm } from "@/components/company-form"

export default function CompanyOnboardingPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-4 md:p-6 lg:p-10">
      <div className="w-full max-w-2xl rounded-lg border border-border bg-card p-4 md:p-6 shadow-sm">
        <CompanyForm />
      </div>
    </div>
  )
}
