import { LoginForm } from "@/components/auth/login-form"
import { AuthGuard } from "@/components/auth/auth-guard"
import Link from "next/link"

export default function LoginPage() {
  return (
    <AuthGuard requireAuth={false} redirectTo="/dashboard">
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50 via-white to-blue-100 px-4 py-12 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 sm:px-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),_transparent_65%)] dark:bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.5),_transparent_60%)]"
        />
        <div className="relative w-full max-w-md space-y-6 rounded-3xl border border-blue-100/60 bg-white/80 p-6 text-center shadow-2xl shadow-blue-100/70 backdrop-blur-sm dark:border-blue-900/50 dark:bg-slate-950/60 dark:shadow-blue-950/40 sm:p-8">
          <Link
            href="/"
            className="flex items-center justify-center text-3xl font-semibold tracking-tight text-blue-700 transition hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
          >
            <span className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-sky-400 dark:via-blue-500 dark:to-indigo-400">
              Taccuino Chirurgico
            </span>
          </Link>
          <LoginForm className="gap-3" />
        </div>
      </div>
    </AuthGuard>
  )
}
