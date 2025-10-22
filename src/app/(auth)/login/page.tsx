import { LoginForm } from "@/components/auth/login-form"
import { AuthGuard } from "@/components/auth/auth-guard"
import Link from "next/link"

export default function LoginPage() {
  return (
    <AuthGuard requireAuth={false} redirectTo="/dashboard">
      <div className="bg-muted flex min-h-svh w-full flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Link href="/" className="flex items-center justify-center gap-2 font-medium text-primary">
            <span className="text-center text-2xl font-bold">Taccuino Chirurgico</span>
          </Link>
          <LoginForm />
        </div>
      </div>
    </AuthGuard>
  )
}
