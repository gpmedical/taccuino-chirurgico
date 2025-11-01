import { SignUpForm } from "@/components/auth/signup-form"
import { AuthGuard } from "@/components/auth/auth-guard"
import Image from "next/image"
import Link from "next/link"

export default function SignUpPage() {
  return (
    <AuthGuard requireAuth={false} redirectTo="/dashboard">
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-linear-to-br from-sky-50 via-white to-blue-100 px-4 py-12 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 sm:px-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.35),transparent_65%)] dark:bg-[radial-gradient(circle_at_top,rgba(30,64,175,0.5),transparent_60%)]"
        />
        <div className="relative w-full max-w-md space-y-6 rounded-3xl border border-blue-100/60 bg-white/80 p-6 text-center shadow-2xl shadow-blue-100/70 backdrop-blur-sm dark:border-blue-900/50 dark:bg-slate-950/60 dark:shadow-blue-950/40 sm:p-8">
          <Link href="/" className="flex items-center justify-center transition hover:opacity-90">
            <Image
              src="/Logo.png"
              alt="Taccuino Chirurgico"
              width={858}
              height={318}
              className="h-28 w-auto dark:drop-shadow-[0_0_12px_rgba(37,99,235,0.35)]"
              priority
            />
          </Link>
          <SignUpForm className="gap-3" />
        </div>
      </div>
    </AuthGuard>
  )
}
