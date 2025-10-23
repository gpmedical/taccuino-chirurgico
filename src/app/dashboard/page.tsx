"use client"

import { Button } from "@/components/ui/button"
import { AuthGuard } from "@/components/auth/auth-guard"
import { useAuth } from "@/contexts/auth-context"

export default function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <AuthGuard requireAuth={true}>
      <div className="flex min-h-svh w-full flex-col items-center justify-center gap-4 px-6 py-10 text-center sm:px-8">
        <div className="w-full max-w-2xl space-y-3">
          <h1 className="text-balance text-3xl font-bold text-primary sm:text-4xl">Taccuino Chirurgico Dashboard</h1>
          <p className="text-pretty text-sm text-muted-foreground sm:text-base">
            Benvenuto, {user?.displayName || "chirurgo"}. Gestisci le tue note operative e monitora i tuoi casi clinici da qualsiasi dispositivo.
          </p>
          <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button onClick={signOut} variant="destructive" className="w-full sm:w-auto">Esci</Button>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
