import { LoginForm } from "@/components/login-form"


export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-4 md:p-6 shadow-sm">
            <LoginForm />
        </div>
    </div>
  )
}
