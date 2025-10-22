import { SignUpForm } from "@/components/auth/signup-form"
import { AuthGuard } from "@/components/auth/auth-guard"
import Link from "next/link"

export default function SignUpPage() {
  return (
    <AuthGuard requireAuth={false} redirectTo="/dashboard">
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Link href="/" className="flex items-center gap-2 self-center font-medium text-primary">
            <div className="flex size-10 items-center justify-center rounded-md">
            <span className="text-2xl font-bold">MyApp</span>
            </div>
          </Link>
          <SignUpForm />
        </div>
      </div>
    </AuthGuard>
  )
}