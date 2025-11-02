import { Suspense } from "react"

import { ResetPasswordClient } from "./reset-password-client"

function ResetPasswordFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-sky-50 via-white to-blue-100 px-4 py-12 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 sm:px-6">
      <span className="text-sm text-muted-foreground">Caricamento...</span>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordClient />
    </Suspense>
  )
}
